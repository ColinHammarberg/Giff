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
from PIL import Image
import requests
import fitz
from PIL import Image
from s3_helper import upload_to_s3
import uuid
from models import UserGif
import os

backend_gifs_folder = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'gifs')

def is_video_url(URL):
    # Check if the URL includes "youtube" or "vimeo"
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
@jwt_required(optional=True)
def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    user_id = get_jwt_identity()
    gif_data = {}  # Initialize gif_data dictionary

    if user_id is None:
        try:
            user_id = get_jwt_identity()
        except RuntimeError:
            pass  # If JWT is not present, user_id remains None

    # Default name if name isn't passed as a value
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
                    loop=0)  # Adjust duration as needed

    # Clean up: Delete individual images and temporary PDF
    for img_path in image_paths:
        os.remove(os.path.join(images_dir, img_path))
    os.rmdir(images_dir)

    print(f"PDF GIF saved at {output_path}")

    # Save the GIF data to the database
    resource_id = str(uuid.uuid4())
    print('user_id', user_id)
    folder_name = f"{user_id}/"
    if user_id:
        upload_to_s3(output_path, 'gift-resources',
                 f"{folder_name}{NAME}", resource_id)
        # Database Entry Here
        print('user-id', user_id)
        gif_data = {
            "name": NAME,
            "resourceId": resource_id,
        }
        db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                    gif_url=output_path, resourceId=resource_id))
        db.session.commit()

    return jsonify({'message': 'GIF generated and uploaded!', 'name': NAME, 'data': [gif_data]})

@jwt_required(optional=True)
def generate_pdf_gifs_from_list():
    data = request.get_json()
    gifData = data['gifData']
    user_id = get_jwt_identity()
    access_token = data.get('access_token')
    print('gifData123', gifData)

    # Check if 'gifData' key exists in the JSON data
    # if 'gifData' not in data:
    #     return jsonify({'error': 'No GIF data provided'})

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
        single_gif_data = response.json().get('data', [])
        generated_gifs_data.extend(single_gif_data)
        print('single_gif_data', single_gif_data)

        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

    return jsonify({'message': 'GIFs generated successfully for all URLs', 'data': generated_gifs_data})

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

@jwt_required()
def download_all_library_gifs():
    data = request.get_json()
    print('gif_data', data)
    gif_data = data.get('gifData', [])
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
            for gif_info in gif_data:
                gif_url = gif_info['url']
                gif_name = gif_info['name']
                # Download the GIF
                response = requests.get(gif_url)
                if response.status_code == 200:
                    # Convert the GIF to a BytesIO object
                    gif_bytes = io.BytesIO(response.content)
                    # Add the GIF data to ZIP
                    zipf.writestr(f'{gif_name}.gif', gif_bytes.getvalue())
                    
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
    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()

    if user_gif:
        user_gif.selectedColor = selected_color
        db.session.commit()
        return jsonify({'message': 'Selected color updated successfully'}), 200
    else:
        return jsonify({'error': 'GIF not found'}), 404

