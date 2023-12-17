from extensions import db
from flask import jsonify, request, send_file
from pytube import YouTube
import cv2
from flask_jwt_extended import jwt_required, get_jwt_identity
from PIL import Image, ImageOps, ImageSequence
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from werkzeug.utils import secure_filename
from utils_helper import is_vimeo_url, is_youtube_url
from gpt_helper import analyze_gif_and_get_description
from utils import resize_gif
from io import BytesIO
import os
import zipfile
import boto3
import requests
import fitz
from s3_helper import upload_to_s3
import uuid
from cv2 import VideoCapture, cvtColor, COLOR_BGR2RGB
from models import UserGif, User
import os
import io
import logging
import traceback

backend_gifs_folder = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'gifs')


def is_video_url(URL):
    return "youtube" in URL or "vimeo" in URL


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

@jwt_required()
def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    user_id = data.get('user_id', get_jwt_identity())
    current_user = User.query.get(user_id)
    resourceType = 'pdf'

    if not User.query.filter_by(id=user_id).first() and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    NAME = data.get('name', f"your_gif-{UserGif.query.filter_by(user_id=user_id).count() + 1}.gif") if user_id else "your_pdf_gif-t.gif"
    if not NAME.endswith('.gif'):
        NAME += '.gif'

    pdf_response = requests.get(URL)
    pdf_document = fitz.open("pdf", pdf_response.content)
    frames = []

    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]
        image_list = page.get_pixmap()
        img = Image.frombytes("RGB", [image_list.width, image_list.height], image_list.samples)
        frames.append(img)

    pdf_document.close()

    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, NAME)

    frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=[1000] * len(frames), loop=0)

    resource_id = str(uuid.uuid4())
    folder_name = f"{user_id}/"
    if current_user:
        upload_to_s3(output_path, 'gift-resources', f"{folder_name}{NAME}", resource_id)
        s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                 aws_secret_access_key='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',
                                 region_name='eu-north-1')
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': 'gift-resources',
                                                                 'Key': f"{user_id}/{NAME}"},
                                                         ExpiresIn=3600)

        description = analyze_gif_and_get_description(presigned_url) if current_user.include_ai else None

        db.session.add(UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path, resourceId=resource_id, ai_description=description, source=URL))
        db.session.commit()
        gif_data = {
            "name": NAME,
            "resourceId": resource_id,
            "resourceType": resourceType,
            "ai_description": description,
        }

    return jsonify({'message': 'GIF generated and uploaded!', 'name': NAME, 'data': [gif_data]})



@jwt_required()
def generate_pdf_gifs_from_list():
    data = request.get_json()
    gifData = data['gifData']
    user_id = get_jwt_identity()
    access_token = data.get('access_token')
    print('gifData123', gifData)

    # Check if 'gifData' key exists in the JSON data
    if 'gifData' not in data:
        return jsonify({'error': 'No GIF data provided'})

    generated_gifs_data = []

    for gif in gifData:
        URL = gif['url']
        name = gif['name']
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.post(
            'https://gift-server-eu-1.azurewebsites.net/generate-pdf-gif',
            json={'url': URL, 'name': name, 'user_id': user_id},
            headers=headers
        )
        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

        # Inspect raw response
        print("Raw Response:", response.text)

        try:
            single_gif_data = response.json().get('data', [])
            generated_gifs_data.extend(single_gif_data)
        except ValueError:
            # Handle the case where the response is not valid JSON
            return jsonify({'error': f'Invalid JSON response from GIF generation for URL: {URL}'})

        print('single_gif_data', single_gif_data)

        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

    return jsonify({'message': 'GIFs generated successfully for all URLs', 'data': generated_gifs_data})


@jwt_required()
def upload_pdf_and_generate_gif():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    gif_data = {}
    resourceType = 'pdf'

    user_exists = User.query.filter_by(id=user_id).first()
    if not user_exists and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400

    pdf_file = request.files['pdf']
    print('pdf_file', pdf_file)

    if pdf_file.filename == '':
        return jsonify({'error': 'Empty PDF file provided'}), 400

    resource_id = str(uuid.uuid4())
    folder_name = f"{user_id}"

    images_dir = os.path.join(os.path.dirname(__file__), 'pdf_images')
    os.makedirs(images_dir, exist_ok=True)

    temp_pdf_path = os.path.join(
        images_dir, secure_filename(f'{pdf_file.filename}.pdf'))
    pdf_file.save(temp_pdf_path)

    try:
        pdf_document = fitz.open(temp_pdf_path)
        frame_durations = []
        print('pdf_document.page_count', pdf_document.page_count)

        for page_number in range(pdf_document.page_count):
            print(f"Processing page: {page_number}")
            page = pdf_document[page_number]
            image_list = page.get_pixmap()
            img = Image.frombytes(
                "RGB", [image_list.width, image_list.height], image_list.samples)
            img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
            img.save(img_path, 'PNG')
            print(f"Image saved at: {img_path}")
            frame_duration = 1.0
            frame_durations.append(int(frame_duration * 1000))

        pdf_document.close()

        image_paths = sorted(os.listdir(images_dir))
        frames = [Image.open(os.path.join(images_dir, img_path))
                  for img_path in image_paths if img_path.endswith('.png')]

        gifs_folder = os.path.join(os.path.dirname(__file__), 'generated_gifs')
        os.makedirs(gifs_folder, exist_ok=True)
        gif_name = f'{pdf_file.filename}.gif'
        output_path = os.path.join(gifs_folder, gif_name)
        print('gif_name', gif_name)

        frames[0].save(output_path, save_all=True,
                       append_images=frames[1:], duration=frame_durations, loop=0)

        for img_path in image_paths:
            os.remove(os.path.join(images_dir, img_path))
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

        
        description = None

        if user_exists:
            upload_to_s3(output_path, 'gift-resources',
                         f"{folder_name}/{gif_name}", resource_id)
            s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                     aws_secret_access_key='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',
                                     region_name='eu-north-1')
            presigned_url = s3_client.generate_presigned_url('get_object',
                                                             Params={'Bucket': 'gift-resources',
                                                                     'Key': f"{user_id}/{gif_name}"},
                                                             ExpiresIn=3600)
            print('presigned_url', presigned_url)

            if current_user.include_ai:
                description = analyze_gif_and_get_description(presigned_url)

            db.session.add(UserGif(user_id=user_id, gif_name=gif_name,
                           gif_url=output_path, resourceId=resource_id, ai_description=description, source="https://gif-t.io"))
            db.session.commit()

        gif_data = {
            "name": gif_name,
            "resourceId": resource_id,
            "resourceType": resourceType,
            "ai_description": description
        }

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred while processing the PDF'}), 500

    return jsonify({'message': 'PDF uploaded and GIF generated!', 'data': [gif_data]}), 200


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


def hex_to_rgb(hex):
    hex = hex.lstrip("#")
    return tuple(int(hex[i:i+2], 16) for i in (0, 2, 4))


def add_border_to_gif(gif_bytes_io, selected_color):
    gif_bytes_io.seek(0)
    pil_gif = Image.open(gif_bytes_io)
    selected_color_tuple = hex_to_rgb(selected_color)

    frames_with_durations = []
    for frame in ImageSequence.Iterator(pil_gif):
        frame = frame.convert("P")

        palette = frame.getpalette()
        colors = frame.getcolors()
        least_used_color = min(colors, key=lambda x: x[0])[1]

        palette[least_used_color * 3: least_used_color *
                3 + 3] = selected_color_tuple
        frame.putpalette(palette)

        frame = ImageOps.expand(frame, border=30, fill=least_used_color)
        # Set duration to 1 second (1000 milliseconds)
        frames_with_durations.append((frame, 1000))

    output_gif_io = io.BytesIO()
    frames_with_durations[0][0].save(
        output_gif_io,
        format='GIF',
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[d for _, d in frames_with_durations],
        loop=0
    )
    output_gif_io.seek(0)
    return output_gif_io


@jwt_required()
def download_all_library_gifs():
    data = request.get_json()
    print('gif_data', data)
    gif_data = data.get('gifData', [])
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
            for gif_info in gif_data:
                gif_url = gif_info['url']
                gif_name = gif_info['name']
                selected_color = gif_info['selectedColor']
                selected_frame = gif_info['selectedFrame']

                response = requests.get(gif_url)
                if response.status_code == 200:
                    gif_bytes = io.BytesIO(response.content)
                    original_gif = Image.open(gif_bytes)

                    original_width, original_height = original_gif.size
                    is_portrait = original_height > original_width

                    selected_resolution = user.selected_resolution if user.selected_resolution else f"{original_width}x{original_height}"

                    resized_gif_bytes_io = resize_gif(
                        gif_bytes, f"{original_width}x{original_height}" if is_portrait else selected_resolution)

                    if selected_color:
                        new_gif_bytes = add_border_to_gif(resized_gif_bytes_io, selected_color)
                    elif selected_frame:
                        s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                                 aws_secret_access_key='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',
                                                 region_name='eu-north-1')
                        presigned_url = s3_client.generate_presigned_url('get_object',
                                                                         Params={'Bucket': 'gift-filter-options',
                                                                                 'Key': selected_frame},
                                                                         ExpiresIn=3600)
                        new_gif_bytes = overlay_filter_on_gif(resized_gif_bytes_io, presigned_url)
                    else:
                        new_gif_bytes = resized_gif_bytes_io

                    zipf.writestr(f'{gif_name}', new_gif_bytes.getvalue())

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



@jwt_required()
def update_selected_color():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    selected_color = data.get('selectedColor')

    # Update the selectedColor for the specified GIF
    user_gif = UserGif.query.filter_by(
        user_id=user_id, resourceId=resource_id).first()

    if user_gif:
        user_gif.selectedColor = selected_color
        user_gif.selectedFrame = None
        db.session.commit()
        return jsonify({'message': 'Selected color updated successfully'}), 200
    else:
        return jsonify({'error': 'GIF not found'}), 404


@jwt_required()
def update_selected_frame():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    selected_frame = data.get('selectedFrame')

    # Update the selectedColor for the specified GIF
    user_gif = UserGif.query.filter_by(
        user_id=user_id, resourceId=resource_id).first()

    if user_gif:
        user_gif.selectedFrame = selected_frame
        user_gif.selectedColor = None
        db.session.commit()
        return jsonify({'message': 'Selected frame updated successfully'}), 200
    else:
        return jsonify({'error': 'GIF not found'}), 404


def overlay_filter_on_gif(gif_bytes_io, filter_url):
    try:
        gif_bytes_io.seek(0)
        pil_gif = Image.open(gif_bytes_io)

        response = requests.get(filter_url)
        if response.status_code != 200:
            raise Exception(
                f"Failed to download filter image, Status code: {response.status_code}")

        filter_bytes_io = io.BytesIO(response.content)
        filter_image = Image.open(filter_bytes_io).convert('RGBA')
        filter_image = filter_image.resize(pil_gif.size)

        overlayed_frames = []
        for frame in ImageSequence.Iterator(pil_gif):
            frame = frame.convert('RGBA')
            overlayed_frame = Image.alpha_composite(frame, filter_image)
            overlayed_frames.append(
                (overlayed_frame, frame.info.get('duration', 1000)))

        output_gif_io = io.BytesIO()
        overlayed_frames[0][0].save(
            output_gif_io,
            format='GIF',
            save_all=True,
            append_images=[frame for frame, _ in overlayed_frames[1:]],
            duration=[d for _, d in overlayed_frames],
            loop=0
        )
        output_gif_io.seek(0)
        return output_gif_io

    except Exception as e:
        logging.exception("Error occurred in overlay_filter_on_gif")
        raise e


@jwt_required()
def download_individual_gif():
    try:
        gif_data = request.get_json()
        selected_color = gif_data.get('selectedColor')
        selected_frame = gif_data.get('selectedFrame')
        gif_url = gif_data.get('url')
        gif_name = gif_data.get('name')
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if gif_url is None:
            return "Invalid GIF URL", 400

        response = requests.get(gif_url)

        if response.status_code == 200:
            gif_bytes_io = io.BytesIO(response.content)
            original_gif = Image.open(gif_bytes_io)

            # Determine the original dimensions
            original_width, original_height = original_gif.size
            selected_resolution = user.selected_resolution if user.selected_resolution else f"{original_width}x{original_height}"
            is_portrait = original_height > original_width
            resized_gif_bytes_io = resize_gif(
                gif_bytes_io, f"{original_width}x{original_height}" if is_portrait else selected_resolution)

            if selected_color:
                modified_gif_bytes_io = add_border_to_gif(
                    resized_gif_bytes_io, selected_color)
            elif selected_frame:
                s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                         aws_secret_access_key='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',
                                         region_name='eu-north-1')
                presigned_url = s3_client.generate_presigned_url('get_object',
                                                                 Params={'Bucket': 'gift-filter-options',
                                                                         'Key': selected_frame},
                                                                 ExpiresIn=3600)
                modified_gif_bytes_io = overlay_filter_on_gif(
                    resized_gif_bytes_io, presigned_url)
            else:
                modified_gif_bytes_io = resized_gif_bytes_io

            return send_file(
                modified_gif_bytes_io,
                as_attachment=True,
                download_name=f'{gif_name}.gif',
                mimetype='image/gif'
            )
        else:
            print(f"Error: Unexpected status code {response.status_code}")
            return "An error occurred with the GIF URL", 400

    except Exception as e:
        print(f"Error downloading individual GIF: {e}")
        return "An error occurred", 500

def generate_video_gif(data, user_id):
    try:
        URL = data.get('url')
        resource_id = str(uuid.uuid4())
        resourceType = 'video'
        NAME = data.get('name', f'{resource_id}.gif') if user_id else f"{resource_id}.gif"
        start_frame = data.get('start_frame', 0)
        end_frame = data.get('end_frame', 300)
        print('data', data, user_id)

        # Determine video source and download video
        if is_youtube_url(URL):
            yt = YouTube(URL)
            video = yt.streams.filter(file_extension='mp4').first()
            print('video1', video)
            video_path = video.download()
            print('video2', video_path)

        elif is_vimeo_url(URL):
            return jsonify({'error': 'Unsupported video URL'}), 200
        else:
            return jsonify({'error': 'Unsupported video URL'}), 400

        cap = VideoCapture(video_path)
        print('cap', cap)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        print('total_frames', total_frames)
        start_frame = max(0, min(start_frame, total_frames - 1))
        print('start_frame', start_frame)
        end_frame = max(0, min(end_frame, total_frames))
        print('end_frame', end_frame)

        frames = []
        for i in range(start_frame, end_frame):
            cap.set(1, i)
            ret, frame = cap.read()
            if ret:
                rgb_frame = cvtColor(frame, COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_frame)
                frames.append(pil_img)

        frames = frames[::3]
        frame_durations = [1] * len(frames)
        print('frame_durations', frame_durations)
        if len(frames) > 0:
            gifs_frontend_folder = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
            backend_gifs_folder = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), 'gifs')
            os.makedirs(gifs_frontend_folder, exist_ok=True)
            os.makedirs(backend_gifs_folder, exist_ok=True)
            output_path = os.path.join(gifs_frontend_folder, NAME)
            backend_output_path = os.path.join(backend_gifs_folder, NAME)

            # Save the GIF
            frames[0].save(
                output_path,
                save_all=True,
                append_images=frames[1:],
                duration=frame_durations,
                loop=0
            )

            frames[0].save(
                backend_output_path,
                save_all=True,
                append_images=frames[1:],
                duration=frame_durations,
                loop=0
            )
        else:
            logging.error("Not enough frames to create a GIF.")
            return jsonify({'error': 'Not enough frames to create a GIF'}), 500

        if user_id:
            folder_name = f"{user_id}/"
            print('folder_name', folder_name)
            upload_to_s3(output_path, 'gift-resources',
                        f"{folder_name}{NAME}", resource_id)

            gif_data = {
                "name": NAME,
                "resourceId": resource_id,
                "resourceType": resourceType
            }
            print('gif_data', gif_data)
            db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                               gif_url=output_path, resourceId=resource_id, source=URL))
            db.session.commit()

        return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})

    except Exception as e:
        logging.error(f"Error in generate_video_gif: {e}")
        traceback.print_exc()
        return jsonify({'error': 'An error occurred during GIF generation'}), 500



def ease_in_quad(t):
    return t * t


@jwt_required(optional=True)
def generate_gif():
    data = request.get_json()
    user_id = data.get('user_id', get_jwt_identity())
    current_user = User.query.get(user_id)
    URL = data.get('url')
    NAME = data.get('name', f"your_gif-{UserGif.query.filter_by(user_id=user_id).count() + 1}.gif") if user_id else "your_gif-t.gif"
    if not NAME.endswith('.gif'):
        NAME += '.gif'

    if is_video_url(URL):
        return generate_video_gif(data, user_id)

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--headless')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')

    service = Service(executable_path="/usr/bin/chromedriver")
    driver = webdriver.Chrome(service=service,options=options)
    driver.get(URL)

    scroll_height = driver.execute_script("return document.body.scrollHeight")
    if scroll_height < 1000:
        driver.quit()
        return jsonify({'error': 'Invalid scroll height'})

    screenshots = []
    scroll_step = 400
    driver.execute_script("document.body.style.overflow = 'hidden'")

    for i in range(0, scroll_height, scroll_step):
        driver.execute_script(f"window.scrollTo(0, {i})")
        screenshots.append(driver.get_screenshot_as_png())

    driver.quit()

    frames_with_durations = []
    for screenshot in screenshots:
        frame = Image.open(BytesIO(screenshot))
        frames_with_durations.append((frame, 1.0))

    output_path = os.path.join('giff-frontend', 'src', 'gifs', NAME)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    frames_with_durations[0][0].save(
        output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )

    resource_id = str(uuid.uuid4())
    folder_name = f"{user_id}/"
    upload_to_s3(output_path, 'gift-resources',
                     f"{folder_name}{NAME}", resource_id)
    s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                 aws_secret_access_key='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',
                                 region_name='eu-north-1')
    presigned_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'gift-resources',
                                                                'Key': f"{user_id}/{NAME}"},
                                                        ExpiresIn=3600)
    description = analyze_gif_and_get_description(presigned_url) if current_user.include_ai else None

    new_gif = UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path, resourceId=resource_id, ai_description=description, source=URL)
    db.session.add(new_gif)
    db.session.commit()

    gif_data = {
        "name": NAME,
        "resourceId": resource_id,
        "resourceType": 'webpage',
        "ai_description": description
    }

    return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})


@jwt_required()
def generate_gifs_from_list():
    data = request.get_json()
    access_token = data.get('access_token')
    user_id = get_jwt_identity()

    gifData = data.get('gifData', [])
    if not gifData:
        return jsonify({'error': 'No GIF data provided'})

    error_messages = set()
    headers = {'Authorization': f'Bearer {access_token}'}

    generated_gifs_data = []

    for gif in gifData:
        URL = gif.get('url')
        name = gif.get('name')

        if not URL:
            error_messages.add("Missing URL")
        else:
            response = requests.post(
                'https://gift-server-eu-1.azurewebsites.net/generate-single-gif',
                json={'url': URL, 'name': name, 'user_id': user_id},
                headers=headers
            )
            if response.status_code != 200:
                error_messages.add(f"Failed to generate GIF for URL: {URL}")
            single_gif_data = response.json().get('data', [])
            generated_gifs_data.extend(single_gif_data)
            print('single_gif_data', single_gif_data)

    if error_messages:
        return jsonify({'error': '\n'.join(error_messages)})

    return jsonify({'message': 'GIFs generated successfully for all URLs', 'data': generated_gifs_data})
