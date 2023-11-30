from models import UserGif, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify, request
from extensions import db
from PIL import Image
from s3_helper import upload_to_s3
from gif_helper import is_video_url, generate_video_gif
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
import uuid
import time
import boto3
import fitz
import requests
import os

@jwt_required()
def generate_extension_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    user_id = data.get('user_id', get_jwt_identity())
    gif_data = {}
    user_exists = User.query.filter_by(id=user_id).first()
    resourceType = 'pdf'

    if not user_exists and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    if user_id is None:
        try:
            user_id = get_jwt_identity()
        except RuntimeError:
            pass

    user_gif_count = UserGif.query.filter_by(user_id=user_id).count()
    next_gif_number = user_gif_count + 1
    NAME = data.get(
        'name', f"your_gif-{next_gif_number}.gif") if user_id else "your_pdf_gif-t.gif"
    images_dir = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'pdf_images')
    if not NAME.endswith('.gif'):
        NAME += '.gif'
    os.makedirs(images_dir, exist_ok=True)

    pdf_response = requests.get(URL)
    pdf_path = os.path.join(images_dir, 'temp.pdf')

    with open(pdf_path, 'wb') as pdf_file:
        pdf_file.write(pdf_response.content)

    pdf_document = fitz.open(pdf_path)
    frame_durations = []

    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]
        image_list = page.get_pixmap()
        img = Image.frombytes(
            "RGB", [image_list.width, image_list.height], image_list.samples)
        img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
        img.save(img_path, 'PNG')
        frame_duration = 1.0
        frame_durations.append(int(frame_duration * 1000))

    pdf_document.close()

    image_paths = sorted(os.listdir(images_dir))
    frames = [Image.open(os.path.join(images_dir, img_path))
              for img_path in image_paths if img_path.endswith('.png')]

    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, NAME)

    frames[0].save(output_path, save_all=True,
                   append_images=frames[1:], duration=frame_durations, loop=0)

    for img_path in os.listdir(images_dir):
        os.remove(os.path.join(images_dir, img_path))
    os.rmdir(images_dir)

    resource_id = str(uuid.uuid4())
    folder_name = f"{user_id}/"
    if user_exists:
        upload_to_s3(output_path, 'gift-resources',
                     f"{folder_name}{NAME}", resource_id)
        s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                aws_secret_access_key='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', 
                                region_name='eu-north-1')
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'gift-resources',
                                                                    'Key': f"{user_id}/{NAME}"},
                                                        ExpiresIn=3600)

        db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                           gif_url=output_path, resourceId=resource_id))
        db.session.commit()
        gif_data = {
            "name": NAME,
            "resourceId": resource_id,
            "resourceType": resourceType,
            "presigned_url": presigned_url
        }

    return jsonify({'message': 'GIF generated and uploaded!', 'name': NAME, 'data': [gif_data]})

@jwt_required(optional=True)
def generate_extension_gif():
    data = request.get_json()
    user_id = data.get('user_id', None)
    resourceType = 'webpage'

    if user_id is None:
        try:
            user_id = get_jwt_identity()
        except RuntimeError:
            pass # If JWT is not present, user_id remains None
    URL = data.get('url')
    user_gif_count = UserGif.query.filter_by(user_id=user_id).count()
    next_gif_number = user_gif_count + 1
    NAME = data.get('name', f"your_gif-{next_gif_number}.gif") if user_id else "your_gif-t.gif"

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
    timer = 400

    scroll_height = driver.execute_script("return document.body.scrollHeight")
    if scroll_height < 1000:
        return jsonify({'error': 'Invalid scroll height'})

    duration = 1.0

    if not NAME.endswith('.gif'):
        NAME += '.gif'

    screenshots_dir = 'screenshots'
    os.makedirs(screenshots_dir, exist_ok=True)
    driver.execute_script("document.body.style.overflow = 'hidden'")

    screenshot_dimensions = None

    for i in range(0, scroll_height, timer):
        driver.execute_script(f"window.scrollTo(0, {i})")
        time.sleep(1)
        screenshot_path = os.path.join(screenshots_dir, f'screenshot_{i}.png')
        driver.save_screenshot(screenshot_path)
        if screenshot_dimensions is None:
            first_screenshot = Image.open(screenshot_path)
            screenshot_dimensions = first_screenshot.size

    driver.quit()

    frames_with_durations = []
    for screenshot in os.listdir(screenshots_dir):
        screenshot_path = os.path.join(screenshots_dir, screenshot)
        frame = Image.open(screenshot_path)
        frames_with_durations.append((frame, duration))

    gifs_frontend_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    backend_gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'gifs')
    os.makedirs(gifs_frontend_folder, exist_ok=True)
    os.makedirs(backend_gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_frontend_folder, NAME)
    frames_with_durations[0][0].save(
        output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )

    resource_id = str(uuid.uuid4())
    print('user_id', user_id)
    folder_name = f"{user_id}/"
    if user_id:
        upload_to_s3(output_path, 'gift-resources',
                 f"{folder_name}{NAME}", resource_id)
        # Database Entry Here
        s3_client = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                                aws_secret_access_key='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', 
                                region_name='eu-north-1')
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                        Params={'Bucket': 'gift-resources',
                                                                    'Key': f"{user_id}/{NAME}"},
                                                        ExpiresIn=3600)

        db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                           gif_url=output_path, resourceId=resource_id))
        db.session.commit()
        gif_data = {
            "name": NAME,
            "resourceId": resource_id,
            "resourceType": resourceType,
            "presigned_url": presigned_url
        }
        

    for screenshot in os.listdir(screenshots_dir):
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    # Return the generated GIF data as a list with a dictionary
    return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})