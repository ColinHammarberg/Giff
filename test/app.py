from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from extensions import db  # Just import db, not app
from flask_cors import CORS
from s3_helper import upload_to_s3, fetch_user_gifs
import uuid
from models import UserGif
import time
from gif_helper import is_video_url, generate_pdf_gif, generate_pdf_gifs_from_list, download_gif, download_all_gifs, download_all_library_gifs
from routes import signin, signout, signup, fetch_user_info, delete_user_profile, update_password
from email_helper import send_email
from gpt_helper import chat_with_gpt
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from PIL import Image
from flask_mail import Mail
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://gift_super_user:Grym123!@localhost/gift_user_db'

# Initialize database with the app
db.init_app(app)

app.secret_key = 'gift_secret_key_123'
jwt = JWTManager(app)
migrate = Migrate(app, db)
mail = Mail(app)


@app.route('/fetch_user_gifs', methods=['GET'])
def fetch_all_user_gifs():
    print('generate')
    return fetch_user_gifs()

@app.route('/fetch_user_info', methods=['GET'])
def fetch_user():
    print('generate')
    return fetch_user_info()


@app.route('/signin', methods=['POST'])
def signin_user():
    print('generate')
    return signin()


@app.route('/signout', methods=['GET'])
def signout_user():
    print('generate')
    return signout()


@app.route('/signup', methods=['POST'])
def signup_user():
    print('generate')
    return signup()

@app.route('/delete_user', methods=['GET'])
def delete_user():
    print('generate')
    return delete_user_profile()

@app.route('/update_user_password', methods=['POST'])
def update_user_password():
    return update_password()

@app.route('/generate-single-gif', methods=['POST'])
def generate_gif():
    data = request.get_json()
    user_id = data.get('user_id', None)

    if user_id is None:
        try:
            user_id = get_jwt_identity()
        except RuntimeError:
            pass  # If JWT is not present, user_id remains None
    URL = data.get('url')
    NAME = data.get('name', f'your_gift-{user_id}.gif') if user_id else "your_gif-t.gif"

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
    backend_gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'gifs')
    os.makedirs(gifs_frontend_folder, exist_ok=True)
    os.makedirs(backend_gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_frontend_folder, NAME)
    backend_output_path = os.path.join(backend_gifs_folder, NAME)
    frames_with_durations[0][0].save(
        output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )
    frames_with_durations[0][0].save(
        backend_output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )

    resource_id = str(uuid.uuid4())
    print('resource_id2', resource_id)
    folder_name = f"{user_id}/"
    if user_id:
        upload_to_s3(output_path, 'gift-resources',
                 f"{folder_name}{NAME}", resource_id)
        # Database Entry Here
        print('user-id', user_id)
        db.session.add(UserGif(user_id=user_id, gif_name=NAME,
                    gif_url=output_path, resourceId=resource_id))
        db.session.commit()

    for screenshot in os.listdir(screenshots_dir):
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    return jsonify({'message': 'GIF generated and uploaded!', 'name': NAME})

@app.route('/download_library_gifs', methods=['POST'])
def download_library_gifs():
    return download_all_library_gifs()

@app.route('/generate-gif-from-list', methods=['POST'])
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

    for gif in gifData:
        URL = gif.get('url')
        name = gif.get('name')

        if not URL:
            error_messages.add("Missing URL")
        else:
            response = requests.post(
                'http://localhost:5000/generate-single-gif',
                json={'url': URL, 'name': name, 'user_id': user_id},
                headers=headers
            )
            if response.status_code != 200:
                error_messages.add(f"Failed to generate GIF for URL: {URL}")

    if error_messages:
        return jsonify({'error': '\n'.join(error_messages)})

    return jsonify({'message': 'GIFs generated successfully for all URLs'})

@app.route('/generate-pdf-gif', methods=['POST'])
def generate_pdf():
    print('generate')
    return generate_pdf_gif()


@app.route('/generate-pdf-gifs-from-list', methods=['POST'])
def generate_pdf_list():
    print('generate')
    return generate_pdf_gifs_from_list()


@app.route('/download-all-gifs', methods=['GET'])
def download_all():
    print('generate')
    return download_all_gifs()


@app.route('/download', methods=['GET'])
def download_single_gif():
    print('generate')
    return download_gif()


@app.route('/send_gif', methods=['POST'])
def send_gif_email():
    print('generate')
    return send_email()


@app.route('/chat', methods=['POST'])
def open_ai_generate():
    print('generate')
    return chat_with_gpt()

if __name__ == '__main__':
    app.run()
