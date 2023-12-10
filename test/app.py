from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from extensions import db
from flask_cors import CORS
from s3_helper import fetch_user_gifs, get_multiple_gifs, fetch_logo, delete_logo, upload_logo, delete_gif
from gif_helper import generate_pdf_gif, generate_pdf_gifs_from_list, download_all_gifs, download_all_library_gifs, update_selected_color, download_individual_gif, upload_pdf_and_generate_gif, generate_video_gif, update_selected_frame, generate_gif, generate_gifs_from_list
from routes import signin, signout, signup, fetch_user_info, delete_user_profile, update_password, keep_access_alive, update_email, verify, include_logo_in_gifs, send_verification_email_again
from chrome_extension_helper import generate_extension_pdf_gif, generate_extension_gif
from reset_password_helper import request_reset_password, reset_user_password
from include_ai_helper import include_ai_in_gifs
from email_helper import send_email
from gpt_helper import chat_with_gpt
from settings_helper import save_user_resolution
from flask_mail import Mail
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential
# from azure.monitor.opentelemetry import configure_azure_monitor

# # Import the tracing api from the `opentelemetry` package.
# from opentelemetry import trace

# key vault init
# keyVaultName = os.environ["KEY_VAULT_NAME"]
KVUri = "https://gift-app-keys.vault.azure.net"
credential = DefaultAzureCredential()
client = SecretClient(vault_url=KVUri, credential=credential)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = client.get_secret("gift-db-connectionstring").value
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://gift_super_user:Grym123!@localhost/gift_user_db'


# Initialize database with the app
db.init_app(app)

app.secret_key = 'gift_secret_key_123'
jwt = JWTManager(app)
migrate = Migrate(app, db)
mail = Mail(app)


@app.route('/ping', methods=['GET'])
def ping():
    return "pong2222111"


@app.route('/send_verification_email', methods=['GET'])
def send_verification_email():
    return send_verification_email_again()


@app.route('/update_selected_color', methods=['POST'])
def update_gif_color():
    print('generate')
    return update_selected_color()


@app.route('/update_selected_frame', methods=['POST'])
def update_gif_frame():
    print('generate')
    return update_selected_frame()

@app.route('/reset_password', methods=['POST'])
def reset_password():
    return request_reset_password()

@app.route('/new_user_password', methods=['POST'])
def new_password():
    return reset_user_password()

@app.route('/toggle_include_logo', methods=['POST'])
def toggle_include_logo():
    return include_logo_in_gifs()

@app.route('/toggle_include_ai', methods=['POST'])
def toggle_include_ai():
    return include_ai_in_gifs()

@app.route('/fetch_user_gifs', methods=['GET'])
def fetch_all_user_gifs():
    print('generate')
    return fetch_user_gifs()


@app.route('/verify_user', methods=['GET'])
def verify_user():
    return verify()


@app.route('/fetch_user_info', methods=['GET'])
def fetch_user():
    print('generate')
    return fetch_user_info()


@app.route('/upload_user_logo', methods=['POST'])
def upload_user_logo():
    return upload_logo()


@app.route('/fetch_user_logo', methods=['GET'])
def fetch_user_logo():
    return fetch_logo()


@app.route('/signin', methods=['POST'])
def signin_user():
    print('generate')
    return signin()


@app.route('/signout', methods=['GET'])
def signout_user():
    print('generate')
    return signout()


@app.route('/keep_access_alive', methods=['GET'])
def keep_user_access_alive():
    return keep_access_alive()


@app.route('/signup', methods=['POST'])
def signup_user():
    print('generate')
    return signup()


@app.route('/update-email', methods=['POST'])
def update_email_address():
    return update_email()


@app.route('/delete_user_logo', methods=['GET'])
def delete_user_logo():
    return delete_logo()


@app.route('/delete-user-profile', methods=['POST'])
def delete_user():
    return delete_user_profile()

@app.route('/generate_extension_pdf_gif', methods=['POST'])
def generate_extension_pdf():
    return generate_extension_pdf_gif()

@app.route('/generate_extension_gif', methods=['POST'])
def generate_extension_standard():
    return generate_extension_gif()

@app.route('/save-user-resolution', methods=['POST'])
def save_resolution():
    return save_user_resolution()

@app.route('/update_user_password', methods=['POST'])
def update_user_password():
    return update_password()

@app.route('/get_multiple_gifs', methods=['POST'])
def get_multiple_gifs_by_request():
    return get_multiple_gifs()


@app.route('/generate-single-gif', methods=['POST'])
def generate_single_gif():
    return generate_gif()


@app.route('/download_library_gifs', methods=['POST'])
def download_library_gifs():
    return download_all_library_gifs()


@app.route('/generate-gif-from-list', methods=['POST'])
def generate_gif_list():
    return generate_gifs_from_list()


@app.route('/generate-pdf-gif', methods=['POST'])
def generate_pdf():
    print('generate')
    return generate_pdf_gif()


@app.route('/generate-pdf-gifs-from-list', methods=['POST'])
def generate_pdf_list():
    print('generate')
    return generate_pdf_gifs_from_list()


@app.route('/delete-gif', methods=['POST'])
def delete_selected_gif():
    return delete_gif()


@app.route('/upload-pdf-generate-gif', methods=['POST'])
def upload_pdf_create_gif():
    return upload_pdf_and_generate_gif()


@app.route('/generate-video-gif', methods=['POST'])
def generate_video_from_gif():
    return generate_video_gif()


@app.route('/download-all-gifs', methods=['GET'])
def download_all():
    print('generate')
    return download_all_gifs()


@app.route('/download-individual-design-gifs', methods=['POST'])
def download_individual_design():
    return download_individual_gif()


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
