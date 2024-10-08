from extensions import db
from flask import jsonify, request, send_file
from pytube import YouTube
import cv2
from flask_jwt_extended import jwt_required, get_jwt_identity
from PIL import Image, ImageOps, ImageSequence
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException, TimeoutException, ElementNotInteractableException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time
from selenium import webdriver
from base64 import b64encode
from werkzeug.utils import secure_filename
from utils_helper import is_vimeo_url, is_youtube_url
from gpt_helper import analyze_gif
from utils import resize_gif
from io import BytesIO
import os
import zipfile
import boto3
import requests
import fitz
from s3_helper import upload_to_s3, upload_frame_to_s3, upload_pdf_frame_to_s3
import uuid
from cv2 import VideoCapture, cvtColor, COLOR_BGR2RGB
from models import UserGif, User, GifCounter
import os
import io
import logging
import traceback

backend_gifs_folder = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'gifs')


def is_video_url(URL):
    return "youtube" in URL or "youtu" in URL

def is_space_instance(URL):
    return "spce" in URL

s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                 aws_secret_access_key='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',
                                 region_name='eu-north-1')


@jwt_required()
def get_user_gifs():
    user_id = get_jwt_identity()
    try:
        user_gifs = UserGif.query.filter_by(user_id=user_id).all()

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
        return jsonify({'gifs': gifs_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint for generating gif out of online pdfs


@jwt_required()
def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    sector_type = data.get('sectorType')
    user_id = data.get('user_id', get_jwt_identity())
    current_user = User.query.get(user_id)
    resourceType = 'pdf'

    if not User.query.filter_by(id=user_id).first() and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    NAME = data.get(
        'name', f"your_gif-{UserGif.query.filter_by(user_id=user_id).count() + 1}.gif") if user_id else "your_pdf_gif-t.gif"
    if not NAME.endswith('.gif'):
        NAME += '.gif'

    pdf_response = requests.get(URL)
    pdf_document = fitz.open("pdf", pdf_response.content)
    frames = []
    frame_urls = [] # List to store pre-signed URLs of frames
    frame_folder_name = f"{user_id}/{NAME}"
    frame_number = 0

    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]
        image_list = page.get_pixmap()
        img = Image.frombytes(
            "RGB", [image_list.width, image_list.height], image_list.samples)
        frames.append(img)
        temp_img_path = os.path.join('/tmp', f'frame_{frame_number}.png')
        img.save(temp_img_path, 'PNG')

        # Upload each frame to S3 and get the pre-signed URL
        frame_s3_path = f"{frame_folder_name}/frame_{frame_number}.png"
        upload_pdf_frame_to_s3(temp_img_path, 'gif-frames', frame_s3_path, str(uuid.uuid4()))
        frame_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': 'gif-frames',
                                                             'Key': frame_s3_path},
                                                     ExpiresIn=3600)
        frame_urls.append(frame_url)
        frame_number += 1

    pdf_document.close()

    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, NAME)

    frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=[
                   1000] * len(frames), loop=0)

    resource_id = str(uuid.uuid4())
    folder_name = f"{user_id}/"
    if current_user:
        upload_to_s3(output_path, 'gift-resources',
                     f"{folder_name}{NAME}", resource_id)
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': 'gift-resources',
                                                                 'Key': f"{user_id}/{NAME}"},
                                                         ExpiresIn=3600)
        
        with open(output_path, "rb") as gif_file:
            gif_content = gif_file.read()
            base64_string = b64encode(gif_content).decode('utf-8')

        description, example_email = analyze_gif(
                presigned_url, current_user, sector_type)
    
        db.session.add(UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path,
                       resourceId=resource_id, ai_description=description, source=URL, example_email=example_email, base64_string=base64_string, frame_urls=frame_urls))
        GifCounter.increment_count()
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
        try:
            single_gif_data = response.json().get('data', [])
            generated_gifs_data.extend(single_gif_data)
        except ValueError:
            # Handle the case where the response is not valid JSON
            return jsonify({'error': f'Invalid JSON response from GIF generation for URL: {URL}'})

        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

    return jsonify({'message': 'GIFs generated successfully for all URLs', 'data': generated_gifs_data})

def select_watermark_url(frame_width):
    """Select the appropriate watermark URL based on frame width."""
    if frame_width > 1200:
        return 'https://gift-general-resources.s3.eu-north-1.amazonaws.com/large.png'
    elif 842 < frame_width <= 1200:
        return 'https://gift-general-resources.s3.eu-north-1.amazonaws.com/large.png'
    else:
        return 'https://gift-general-resources.s3.eu-north-1.amazonaws.com/large.png'

def overlay_watermark(frame):
    """Overlay watermark on the bottom right of the frame with 4px padding."""
    frame_width, frame_height = frame.size
    watermark_url = select_watermark_url(frame_width)
    
    response = requests.get(watermark_url)
    if response.status_code == 200:
        watermark = Image.open(BytesIO(response.content))
    else:
        raise Exception(f"Failed to fetch watermark image from {watermark_url}.")

    watermark_width, watermark_height = watermark.size
    watermark_position = (frame_width - watermark_width - 4, frame_height - watermark_height - 4)
    
    if watermark.mode == 'RGBA':
        frame.paste(watermark, watermark_position, watermark)
    else:
        frame.paste(watermark, watermark_position)

    return frame

@jwt_required()
def upload_pdf_and_generate_gif():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    sector_type = request.form.get('sectorType', 'default')
    gif_data = {}
    resourceType = 'pdf'

    user_exists = User.query.filter_by(id=user_id).first()
    gif_count = UserGif.query.filter_by(user_id=user_id).count() + 1
    if not user_exists and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400

    pdf_file = request.files['pdf']

    if pdf_file.filename == '':
        return jsonify({'error': 'Empty PDF file provided'}), 400

    resource_id = str(uuid.uuid4())
    NAME = f"{pdf_file.filename}-{gif_count}"
    folder_name = f"{user_id}"

    images_dir = os.path.join(os.path.dirname(__file__), 'pdf_images')
    os.makedirs(images_dir, exist_ok=True)

    temp_pdf_path = os.path.join(
        images_dir, secure_filename(f'{pdf_file.filename}.pdf'))
    pdf_file.save(temp_pdf_path)

    try:
        pdf_document = fitz.open(temp_pdf_path)
        frame_durations = []
        frame_urls = []
        frame_folder_name = f"{user_id}/{NAME}.gif"
        frame_number = 0

        for page_number in range(pdf_document.page_count):
            page = pdf_document[page_number]
            image_list = page.get_pixmap()
            img = Image.frombytes(
                "RGB", [image_list.width, image_list.height], image_list.samples)
            img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
            if current_user.watermark:
                img_with_watermark = overlay_watermark(img)
                img_with_watermark.save(img_path, 'PNG')
            else:
                img.save(img_path, 'PNG')
            frame_duration = 1.0
            frame_durations.append(int(frame_duration * 1000))
            img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
            img.save(img_path, 'PNG')

            # Use frame number in the file path
            frame_s3_path = f"{frame_folder_name}/frame_{frame_number}.png"
            upload_pdf_frame_to_s3(img_path, 'gif-frames', frame_s3_path, str(uuid.uuid4()))
            frame_number += 1

            frame_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'gif-frames',
                                                                'Key': frame_s3_path},
                                                        ExpiresIn=3600)
            frame_urls.append(frame_url)

        pdf_document.close()

        image_paths = sorted(os.listdir(images_dir))
        frames = [Image.open(os.path.join(images_dir, img_path))
                  for img_path in image_paths if img_path.endswith('.png')]

        gifs_folder = os.path.join(os.path.dirname(__file__), 'generated_gifs')
        os.makedirs(gifs_folder, exist_ok=True)
        gif_name = f'{NAME}.gif'
        output_path = os.path.join(gifs_folder, gif_name)

        frames[0].save(output_path, save_all=True,
                       append_images=frames[1:], duration=frame_durations, loop=0)

        for img_path in image_paths:
            os.remove(os.path.join(images_dir, img_path))
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

        description = None
        example_email = None

        if user_exists:
            upload_to_s3(output_path, 'gift-resources',
                         f"{folder_name}/{gif_name}", resource_id)
            presigned_url = s3_client.generate_presigned_url('get_object',
                                                             Params={'Bucket': 'gift-resources',
                                                                     'Key': f"{user_id}/{gif_name}"},
                                                             ExpiresIn=3600)
            with open(output_path, "rb") as gif_file:
                gif_content = gif_file.read()
                base64_string = b64encode(gif_content).decode('utf-8')

            description, example_email = analyze_gif(
                presigned_url, current_user, sector_type)

            db.session.add(UserGif(user_id=user_id, gif_name=gif_name,
                           gif_url=output_path, resourceId=resource_id, ai_description=description, example_email=example_email, source="https://gif-t.io", base64_string=base64_string, frame_urls=frame_urls))
            GifCounter.increment_count()
            db.session.commit()

        gif_data = {
            "name": gif_name,
            "resourceId": resource_id,
            "resourceType": resourceType,
            "ai_description": description,
            "example_email": example_email
        }

    except Exception as e:
        return jsonify({'error': 'An error occurred while processing the PDF'}), 500

    return jsonify({'message': 'GIF generated and uploaded!', 'data': [gif_data]}), 200


def download_all_gifs():
    gifs_folder = backend_gifs_folder
    try:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
            for root, _, files in os.walk(gifs_folder):
                for file in files:
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
                        new_gif_bytes = add_border_to_gif(
                            resized_gif_bytes_io, selected_color)
                    elif selected_frame:
                        presigned_url = s3_client.generate_presigned_url('get_object',
                                                                         Params={'Bucket': 'gift-filter-options',
                                                                                 'Key': selected_frame},
                                                                         ExpiresIn=3600)
                        new_gif_bytes = overlay_filter_on_gif(
                            resized_gif_bytes_io, presigned_url)
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
        return "An error occurred", 500

@jwt_required()
def update_selected_color():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    selected_color = data.get('selectedColor', '#FFFFFF')

    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()
    if not user_gif:
        return jsonify({'error': 'GIF not found'}), 404

    bucket_name = 'gift-resources'
    gif_key = f"{user_id}/{user_gif.gif_name}"

    # Download the existing GIF
    gif_object = s3_client.get_object(Bucket=bucket_name, Key=gif_key)
    gif_bytes_io = io.BytesIO(gif_object['Body'].read())
    gif_bytes_io.seek(0)
    pil_gif = Image.open(gif_bytes_io)
    selected_color_tuple = hex_to_rgb(selected_color)
    # resize_percentage = 0.4
    # new_size = (int(pil_gif.width * resize_percentage), int(pil_gif.height * resize_percentage))

    frames_with_durations = []
    for frame in ImageSequence.Iterator(pil_gif):
        frame = frame.convert("P")
        # frame = frame.resize(new_size, Image.Resampling.LANCZOS)
        palette = frame.getpalette()
        colors = frame.getcolors()
        least_used_color = min(colors, key=lambda x: x[0])[1]

        palette[least_used_color * 3: least_used_color * 3 + 3] = selected_color_tuple
        frame.putpalette(palette)

        frame = ImageOps.expand(frame, border=30, fill=least_used_color)
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

    gif_content = output_gif_io.getvalue()
    base64_string = b64encode(gif_content).decode('utf-8')

    user_gif.selectedColor = selected_color
    user_gif.base64_string = base64_string
    db.session.commit()

    s3_client.put_object(Bucket=bucket_name, Key=gif_key, Body=output_gif_io.getvalue())

    presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': bucket_name,
                                                             'Key': gif_key},
                                                     ExpiresIn=3600)  # URL expiry time

    return jsonify({'message': 'GIF updated with border successfully', 'new_gif_url': presigned_url}), 200


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
        resourceType = gif_data.get('resourceType')
        selected_frame = gif_data.get('selectedFrame')
        gif_url = gif_data.get('url')
        gif_name = gif_data.get('name')
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if gif_url is None:
            return "Invalid GIF URL", 400
        
        response = requests.get(gif_url)
        if response.status_code != 200:
            return "An error occurred with the GIF URL", 400
        
        gif_bytes_io = io.BytesIO(response.content)
        original_gif = Image.open(gif_bytes_io)
        original_width, original_height = original_gif.size
        is_portrait = original_height > original_width
        selected_resolution = user.selected_resolution if user.selected_resolution else f"{original_width}x{original_height}"

        if resourceType == 'video':
            if not selected_color:
                resized_gif_bytes_io = resize_gif(gif_bytes_io, selected_resolution)
                modified_gif_bytes_io = resized_gif_bytes_io
            else:
                resized_gif_bytes_io = resize_gif(gif_bytes_io, selected_resolution)
                modified_gif_bytes_io = add_border_to_gif(
                    resized_gif_bytes_io, selected_color)
        else:
            resized_gif_bytes_io = resize_gif(
                gif_bytes_io, f"{original_width}x{original_height}" if is_portrait else selected_resolution)

            if selected_color:
                modified_gif_bytes_io = add_border_to_gif(
                    resized_gif_bytes_io, selected_color)
            elif selected_frame:
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
    except Exception as e:
        return "An error occurred", 500


def generate_video_gif(data, user_id):
    try:
        URL = data.get('url')
        resource_id = str(uuid.uuid4())
        resourceType = 'video'
        NAME = data.get(
            'name', f'{resource_id}.gif') if user_id else f"{resource_id}.gif"
        start_frame = data.get('start_frame', 0)
        end_frame = data.get('end_frame', 300)
        current_user = User.query.get(user_id)

        # Determine video source and download video
        yt = YouTube(URL)
        video = yt.streams.filter(file_extension='mp4').first()
        video_path = video.download()


        cap = VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        start_frame = max(0, min(start_frame, total_frames - 1))
        end_frame = max(0, min(end_frame, total_frames))

        frames = []
        frame_step = 5
        for i in range(start_frame, end_frame, frame_step):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                rgb_frame = cvtColor(frame, COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_frame)
                if current_user.watermark:
                    pil_img = overlay_watermark(pil_img)
                frames.append(pil_img)

        frame_durations = [1] * len(frames)
        if len(frames) > 0:
            gifs_frontend_folder = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
            backend_gifs_folder = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), 'gifs')
            os.makedirs(gifs_frontend_folder, exist_ok=True)
            os.makedirs(backend_gifs_folder, exist_ok=True)
            output_path = os.path.join(gifs_frontend_folder, NAME)
            backend_output_path = os.path.join(backend_gifs_folder, NAME)

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
            upload_to_s3(output_path, 'gift-resources',
                         f"{folder_name}{NAME}", resource_id)
            presigned_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'gift-resources',
                                                                    'Key': f"{user_id}/{NAME}"},
                                                        ExpiresIn=3600)
            
            with open(output_path, "rb") as gif_file:
                gif_content = gif_file.read()
                base64_string = b64encode(gif_content).decode('utf-8')

            gif_data = {
                "name": NAME,
                "resourceId": resource_id,
                "resourceType": resourceType,
                "presigned_url": presigned_url
            }
            db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                                   gif_url=output_path, resourceId=resource_id, source=URL, base64_string=base64_string, resourcetype=resourceType))
            GifCounter.increment_count()
            db.session.commit()

        return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})

    except Exception as e:
        logging.error(f"Error in generate_video_gif: {e}")
        return jsonify({'error': 'An error occurred during GIF generation'}), 500


def ease_in_quad(t):
    return t * t

@jwt_required(optional=True)
def generate_gif():
    data = request.get_json()
    user_id = data.get('user_id', get_jwt_identity())
    current_user = User.query.get(user_id)
    URL = data.get('url')
    sector_type = data.get('sectorType')
    NAME = data.get(
        'name', f"your_gif-{UserGif.query.filter_by(user_id=user_id).count() + 1}.gif") if user_id else "your_gif-t.gif"
    if not NAME.endswith('.gif'):
        NAME += '.gif'

    if is_video_url(URL):
        return generate_video_gif(data, user_id)
        
    if is_space_instance(URL):
        return generate_space_gif(data, user_id)

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--headless')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument("--disable-notifications")
    options.add_argument("disable-infobars")
    service = Service(executable_path="/usr/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(URL)

    try:
        WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.XPATH, "//button | //a"))
        )
        cookie_elements = driver.find_elements(By.XPATH, "//button[contains(., 'Accept') or contains(., 'Agree') or contains(., 'Godkänn') or contains(., 'OK') or contains(., 'Continue') or contains(., 'Fortsätt') or contains(., 'Jag godkänner') or contains(., 'Okej') or contains(., 'Accept All Cookies')] | //a[contains(., 'Accept') or contains(., 'Agree') or contains(., 'OK') or contains(., 'Godkänn') or contains(., 'Continue') or contains(., 'Fortsätt') or contains(., 'Jag godkänner' or contains(., 'Okej') or contains(., 'Accept All Cookies'))]")
        for element in cookie_elements:
            try:
                WebDriverWait(driver, 1).until(EC.element_to_be_clickable(element))
                ActionChains(driver).move_to_element(element).perform()
                element.click()
                break
            except (ElementClickInterceptedException, NoSuchElementException, ElementNotInteractableException):
                continue
    except TimeoutException:
        print("No relevant elements found or they were not clickable")
    time.sleep(1)

    scroll_height = driver.execute_script("return document.body.scrollHeight")
    if scroll_height < 1000:
        driver.quit()
        return jsonify({'error': 'Invalid scroll height'})

    screenshots = []
    scroll_step = 400
    driver.execute_script("document.body.style.overflow = 'hidden'")
    frame_folder_name = f"{user_id}/{NAME}"
    frame_number = 0
    frame_urls = []
    for i in range(0, scroll_height, scroll_step):
        driver.execute_script(f"window.scrollTo(0, {i})")
        screenshot = driver.get_screenshot_as_png()
        frame = Image.open(BytesIO(screenshot))
        bytes_io = BytesIO()
        if current_user.watermark:
            img_with_watermark = overlay_watermark(frame)
            img_with_watermark.save(bytes_io, format='PNG')
        frame.save(bytes_io, format='PNG')
        screenshots.append(bytes_io)
        bytes_io.seek(0)  # Reset the pointer to the start of the bytes_io stream
        
        # Prepare for S3 upload
        frame_s3_path = f"{frame_folder_name}/frame_{frame_number}.png"
        upload_frame_to_s3(bytes_io, 'gif-frames', frame_s3_path, str(uuid.uuid4()))
        frame_number += 1
        frame_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': 'gif-frames',
                                                             'Key': frame_s3_path},
                                                     ExpiresIn=3600)
        frame_urls.append(frame_url)

    driver.quit()

    frames_with_durations = []
    for screenshot in screenshots:
        frame = Image.open(screenshot)
        bytes_io = BytesIO()
        frame.save(bytes_io, format='PNG')
        bytes_io.seek(0)
        frames_with_durations.append((Image.open(bytes_io), 1.0))

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
    presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': 'gift-resources',
                                                             'Key': f"{user_id}/{NAME}"},
                                                     ExpiresIn=3600)
    
    with open(output_path, "rb") as gif_file:
        gif_content = gif_file.read()
        base64_string = b64encode(gif_content).decode('utf-8')
    description, example_email = analyze_gif(
                presigned_url, current_user, sector_type)

    new_gif = UserGif(
        user_id=user_id,
        gif_name=NAME,
        gif_url=output_path,
        resourceId=resource_id,
        ai_description=description,
        source=URL,
        frame_urls=frame_urls,
        base64_string=base64_string,
        example_email=example_email
    )
    db.session.add(new_gif)
    GifCounter.increment_count()
    db.session.commit()


    gif_data = {
        "name": NAME,
        "resourceId": resource_id,
        "resourceType": 'webpage',
        "ai_description": description,
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

    if error_messages:
        return jsonify({'error': '\n'.join(error_messages)})

    return jsonify({'message': 'GIFs generated successfully for all URLs', 'data': generated_gifs_data})

@jwt_required(optional=True)
def generate_space_gif(data, user_id):
    current_user = User.query.get(user_id)
    URL = data.get('url')
    sector_type = data.get('sectorType')
    NAME = data.get(
        'name', f"your_gif-{UserGif.query.filter_by(user_id=user_id).count() + 1}.gif") if user_id else "your_gif-t.gif"
    if not NAME.endswith('.gif'):
        NAME += '.gif'

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--headless')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument("--disable-notifications")
    options.add_argument("disable-infobars")
    service = Service(executable_path="/usr/bin/chromedriver")
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(URL)

    try:
        WebDriverWait(driver, 10).until(
            EC.frame_to_be_available_and_switch_to_it((By.XPATH, "//iframe[@title='cookieFirst']"))
        )

        cookie_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@data-cookiefirst-action='accept']"))
        )
        cookie_button.click()

        driver.switch_to.default_content()

    except TimeoutException:
        driver.switch_to.default_content()  # Ensure to switch back even if the button is not found

    time.sleep(1)

    scroll_pause_time = 1
    scroll_increment = 400

    screenshots = []
    frame_folder_name = f"{user_id}/{NAME}"
    frame_number = 0
    frame_urls = []

    scrollable_element = driver.find_element(By.CLASS_NAME, "cms-theme-preview-container")
    driver.execute_script("arguments[0].style.overflow = 'hidden'", scrollable_element)
    
    last_scroll_position = 0

    while True:
        driver.execute_script("arguments[0].scrollTop += arguments[1]", scrollable_element, scroll_increment)
        time.sleep(scroll_pause_time)

        current_scroll_position = driver.execute_script("return arguments[0].scrollTop", scrollable_element)
        if current_scroll_position <= last_scroll_position:
            break

        last_scroll_position = current_scroll_position

        screenshot = driver.get_screenshot_as_png()
        frame = Image.open(BytesIO(screenshot))
        bytes_io = BytesIO()
        print('current_user', current_user.watermark)
        if current_user.watermark:
            img_with_watermark = overlay_watermark(frame)
            img_with_watermark.save(bytes_io, format='PNG')
        frame.save(bytes_io, format='PNG')
        screenshots.append(bytes_io)
        bytes_io.seek(0)
        screenshots.append(bytes_io)
        frame_number += 1
        frame_s3_path = f"{frame_folder_name}/frame_{frame_number}.png"
        upload_frame_to_s3(bytes_io, 'gif-frames', frame_s3_path, str(uuid.uuid4()))
        frame_url = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': 'gif-frames',
                                                            'Key': frame_s3_path},
                                                    ExpiresIn=3600)
        frame_urls.append(frame_url)

    driver.quit()

    frames_with_durations = []
    for screenshot in screenshots:
        frame = Image.open(screenshot)
        bytes_io = BytesIO()
        frame.save(bytes_io, format='PNG')
        bytes_io.seek(0)
        frames_with_durations.append((Image.open(bytes_io), 1.0))

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
    presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': 'gift-resources',
                                                             'Key': f"{user_id}/{NAME}"},
                                                     ExpiresIn=3600)
    
    with open(output_path, "rb") as gif_file:
        gif_content = gif_file.read()
        base64_string = b64encode(gif_content).decode('utf-8')
    description, example_email = analyze_gif(
                presigned_url, current_user, sector_type)

    new_gif = UserGif(
        user_id=user_id,
        gif_name=NAME,
        gif_url=output_path,
        resourceId=resource_id,
        ai_description=description,
        source=URL,
        frame_urls=frame_urls,
        base64_string=base64_string,
        example_email=example_email
    )
    db.session.add(new_gif)
    GifCounter.increment_count()
    db.session.commit()

    gif_data = {
        "name": NAME,
        "resourceId": resource_id,
        "resourceType": 'webpage',
        "presigned_url": presigned_url,
        "ai_description": description,
    }

    return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})

@jwt_required()
def upload_video_gif():
    try:
        user_id = get_jwt_identity()
        resource_id = str(uuid.uuid4())
        resourceType = 'video'
        NAME = f'{resource_id}.gif'

        video_file = request.files['video']
        project_root = os.path.dirname(os.path.abspath(__file__))
        temp_storage_path = os.path.join(project_root, 'temp_videos')
        os.makedirs(temp_storage_path, exist_ok=True)
        video_path = os.path.join(temp_storage_path, secure_filename(video_file.filename))
        video_file.save(video_path)

        cap = cv2.VideoCapture(video_path)
        frames = []
        frame_step = 5
        frame_rate = cap.get(cv2.CAP_PROP_FPS)
        
        target_width = 580
        ret, frame = cap.read()
        if not ret:
            return jsonify({'error': 'Failed to read video file'}), 500
        height, width = frame.shape[:2]
        resize_ratio = target_width / width
        target_height = int(height * resize_ratio)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_id = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
            if frame_id % frame_step == 0:
                resized_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)
                rgb_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
                frames.append(Image.fromarray(rgb_frame))

        cap.release()

        if not frames:
            os.remove(video_path)  # Clean up the temporary file
            logging.error("Not enough frames to create a GIF.")
            return jsonify({'error': 'Not enough frames to create a GIF'}), 500

        duration_per_frame = int((1 / frame_rate) * frame_step * 1000)

        output_path = os.path.join(project_root, 'gifs', NAME)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration_per_frame,
            loop=0,
            optimize=True,
            quality=20
        )

        if user_id:
            upload_to_s3(output_path, 'gift-resources', f"{user_id}/{NAME}", resource_id)
            presigned_url = s3_client.generate_presigned_url('get_object',
                                                             Params={'Bucket': 'gift-resources',
                                                                     'Key': f"{user_id}/{NAME}"},
                                                             ExpiresIn=3600)

            with open(output_path, "rb") as gif_file:
                gif_content = gif_file.read()
                base64_string = b64encode(gif_content).decode('utf-8')

            gif_data = {
                "name": NAME,
                "resourceId": resource_id,
                "resourceType": resourceType,
                "presigned_url": presigned_url
            }
            db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                                gif_url=output_path, resourceId=resource_id, base64_string=base64_string, resourcetype=resourceType))
            GifCounter.increment_count()
            db.session.commit()

        return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})

    except Exception as e:
        logging.error(f"Error in upload_video_gif: {e}")
        return jsonify({'error': 'An error occurred during GIF generation'}), 500