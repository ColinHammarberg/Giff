from extensions import db
from flask import jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import imageio
import io
import os
import time
import zipfile
import requests
import fitz
from PIL import Image
from s3_helper import upload_to_s3
import uuid
from models import UserGif

backend_gifs_folder = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'gifs')

def is_video_url(URL):
    # Check if the URL includes "youtube" or "vimeo"
    return "youtube" in URL or "vimeo" in URL

@jwt_required()
def generate_gif():
    data = request.get_json()
    user_id = get_jwt_identity()
    print('userId1', user_id)
    URL = data.get('url')
    NAME = data.get('name', 'scroll.gif')

    if is_video_url(URL):
        return jsonify({'error': 'video url'})

    chrome_options = Options()
    chrome_options.add_argument('--headless')
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(URL)

    scroll_height = driver.execute_script("return document.body.scrollHeight")
    if scroll_height < 1000:
        return jsonify({'error': 'Invalid scroll height'})

    elif 1000 <= scroll_height < 3000:
        timer = 200
        duration = timer / 600.0  # 0.333s / per screenshot

    elif 3000 <= scroll_height < 5000:
        timer = 300
        duration = timer / 800.0  # 0.375s / per screenshot

    elif 5000 <= scroll_height < 9000:
        timer = 400
        duration = timer / 1500.0  # 0.266s / per screenshot

    else:
        timer = 500
        duration = timer / 2000.0  # 0.25s / per screenshot

    if not NAME.endswith('.gif'):
        NAME += '.gif'

    screenshots_dir = 'screenshots'
    os.makedirs(screenshots_dir, exist_ok=True)
    driver.execute_script("document.body.style.overflow = 'hidden'")

    for i in range(0, scroll_height, timer):
        driver.execute_script(f"window.scrollTo(0, {i})")
        time.sleep(1)
        screenshot_path = os.path.join(screenshots_dir, f'screenshot_{i}.png')
        driver.save_screenshot(screenshot_path)

    driver.quit()

    frames_with_durations = []
    for screenshot in os.listdir(screenshots_dir):
        screenshot_path = os.path.join(screenshots_dir, screenshot)
        frame = Image.open(screenshot_path)
        frames_with_durations.append((frame, duration))

    gifs_frontend_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'test', 'gifs')
    os.makedirs(gifs_frontend_folder, exist_ok=True)
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_frontend_folder, NAME)
    frames_with_durations[0][0].save(
        output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )

    resource_id = str(uuid.uuid4())
    print('resource_id2', resource_id)
    folder_name = f"{user_id}/"
    upload_to_s3(output_path, 'gift-resources', f"{folder_name}{NAME}", resource_id)
    # Database Entry Here
    print('user-id', user_id)
    db.session.add(UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path, resourceId=resource_id))
    db.session.commit()

    for screenshot in os.listdir(screenshots_dir):
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    return jsonify({'message': 'GIF generated and uploaded!'})

def generate_gifs_from_list():
    data = request.get_json()
    print('data', data)
    # Use get method with a default value to handle missing 'gifData'
    gifData = data.get('gifData', [])

    if not gifData:
        return jsonify({'error': 'No GIF data provided'})

    error_messages = set()  # Use a set to store unique error messages

    for gif in gifData:
        URL = gif.get('url')
        name = gif.get('name')

        if not URL:
            error_messages.add("Missing URL")
        else:
            # Check if the URL is a YouTube or Vimeo link
            if is_video_url(URL):
                error_messages.add("video")
            else:
                response = requests.post(
                    'http://localhost:5000/generate-single-gif', json={'url': URL, 'name': name})
                if response.status_code != 200:
                    error_messages.add(
                        f"Failed to generate GIF for URL: {URL}")

                # Check the scroll_height error for each URL
                single_gif_data = response.json()
                if 'error' in single_gif_data and single_gif_data['error'] == 'Invalid scroll height':
                    error_messages.add("Invalid scroll height")

    if error_messages:
        return jsonify({'error': '\n'.join(error_messages)})

    return jsonify({'message': 'GIFs generated successfully for all URLs'})


@jwt_required()
def get_user_gifs():
    user_id = get_jwt_identity()
    print(f"User ID: {user_id}")  # Debug line
    try:
        user_gifs = UserGif.query.filter_by(user_id=user_id).all()
        print(f"User GIFs: {user_gifs}")  # Debug line
        
        if not user_gifs:
            return jsonify({'message': 'No GIFs found for this user'}), 404

        gifs_data = []
        for gif in user_gifs:
            gif_data = {
                'gif_name': gif.gif_name,
                'gif_url': gif.gif_url,
                'resourceId': gif.resourceId
            }
            gifs_data.append(gif_data)
        print(f"Returning Data: {gifs_data}")  # Debug line
        return jsonify({'gifs': gifs_data})
    except Exception as e:
        print("An exception occurred:", e)
        return jsonify({'error': str(e)}), 500


# Endpoint for generating gif out of online pdfs

def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    user_id = data.get('user_id', None)

    if user_id is None:
        try:
            user_id = get_jwt_identity()
        except RuntimeError:
            pass  # If JWT is not present, user_id remains None

    # default name if name isn't passed as a value
    NAME = data.get('name', f'pdf_animation-{user_id}.gif') if user_id else "your_pdf_gif-t.gif"
    # Create a temporary directory to store individual images
    images_dir = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'pdf_images')
    if not NAME.endswith('.gif'):
        NAME += '.gif'
    os.makedirs(images_dir, exist_ok=True)

    # Download the PDF content
    pdf_response = requests.get(URL)
    pdf_path = os.path.join(images_dir, 'temp.pdf')

    with open(pdf_path, 'wb') as pdf_file:
        pdf_file.write(pdf_response.content)

    # Use PyMuPDF to extract images from PDF pages
    pdf_document = fitz.open(pdf_path)

    print('pdf_document.page_count', pdf_document.page_count)

    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]
        image_list = page.get_pixmap()
        img = Image.frombytes(
            "RGB", [image_list.width, image_list.height], image_list.samples)
        img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
        img.save(img_path, 'PNG')

    pdf_document.close()

    # Create a GIF from the images
    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, NAME)

    image_paths = sorted(os.listdir(images_dir))
    frames = [Image.open(os.path.join(images_dir, img_path))
              for img_path in image_paths if img_path.endswith('.png')]
    frame_durations = [0.5] * len(frames)
    print('frame_durations', frame_durations)
    imageio.mimsave(output_path, frames, duration=frame_durations,
                    loop=0) # Adjust duration as needed
    # Clean up: Delete individual images and temporary PDF
    for img_path in image_paths:
        os.remove(os.path.join(images_dir, img_path))
    os.rmdir(images_dir)

    print(f"PDF GIF saved at {output_path}")

    return jsonify({'message': 'GIF generated and uploaded!', 'name': NAME})

def generate_pdf_gifs_from_list():
    data = request.get_json()
    gifData = data['gifData']
    print('data', gifData)

    # Check if 'gifData' key exists in the JSON data
    if 'gifData' not in data:
        return jsonify({'error': 'No GIF data provided'})

    for gif in gifData:
        URL = gif['url']
        name = gif['name']

        response = requests.post(
            'http://localhost:5000/generate-pdf-gif', json={'url': URL, 'name': name})

        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

    return jsonify({'message': 'GIFs generated successfully for all URLs'})

def download_gif():
    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gif_filename = 'scrolling_animation.gif'
    gif_path = os.path.join(gifs_folder, gif_filename)
    return send_file(gif_path, as_attachment=True, attachment_filename=gif_filename)


def download_all_gifs():
    gifs_folder = backend_gifs_folder

    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
            for root, _, files in os.walk(gifs_folder):
                for file in files:
                    print('file', file)
                    if file.lower().endswith('.gif'):  # Confirm it's a GIF
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, gifs_folder)
                        zipf.write(file_path, arcname=arcname)

        zip_buffer.seek(0)

        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='your-gift-bag.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        print(f"Error creating ZIP file: {e}")
        return "An error occurred", 500
