from models import UserGif, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify, request
from extensions import db
from PIL import Image
from s3_helper import upload_to_s3
from gif_helper import is_video_url, generate_video_gif
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException, TimeoutException, ElementNotInteractableException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium import webdriver
import uuid
from io import BytesIO
import fitz
import requests
import os
import boto3

@jwt_required()
def generate_extension_pdf_gif():
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
        
        db.session.add(UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path, resourceId=resource_id))
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
    user_id = data.get('user_id', get_jwt_identity())
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

    try:
        WebDriverWait(driver, 4).until(
            EC.presence_of_element_located((By.XPATH, "//button | //a"))
        )
        cookie_elements = driver.find_elements(By.XPATH, "//button[contains(., 'Accept') or contains(., 'Agree') or contains(., 'Godkänn') or contains(., 'OK') or contains(., 'Continue') or contains(., 'Fortsätt') or contains(., 'Jag godkänner') or contains(., 'Okej') or contains(., 'Accept All Cookies')] | //a[contains(., 'Accept') or contains(., 'Agree') or contains(., 'OK') or contains(., 'Godkänn') or contains(., 'Continue') or contains(., 'Fortsätt') or contains(., 'Jag godkänner' or contains(., 'Okej') or contains(., 'Accept All Cookies'))]")
        for element in cookie_elements:
            try:
                WebDriverWait(driver, 2).until(EC.element_to_be_clickable(element))
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
    
    
    new_gif = UserGif(user_id=user_id, gif_name=NAME, gif_url=output_path, resourceId=resource_id)
    db.session.add(new_gif)
    db.session.commit()

    gif_data = {
        "name": NAME,
        "resourceId": resource_id,
        "resourceType": 'webpage',
        "presigned_url": presigned_url
    }

    return jsonify({'message': 'GIF generated and uploaded!', "name": NAME, 'data': [gif_data]})