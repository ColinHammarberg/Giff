from sendgrid.helpers.mail import Mail
from extensions import db
from sendgrid import SendGridAPIClient
from flask import jsonify, request
from werkzeug.security import generate_password_hash
from models import User
import secrets

RESET_PASSWORD_URL = 'https://giveagif-t.com/new-password'
SENDGRID_API_KEY = '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'
serializer_secret_key = secrets.token_urlsafe(16)
SERIALIZER_SECRET_KEY = serializer_secret_key


def send_reset_password_email(email, reset_password_code):
    reset_link = f"{RESET_PASSWORD_URL}?code={reset_password_code}"
    TEMPLATE_ID = 'd-83abe0bcf0db4281879d3351ce6706a6'
    message = Mail(
        from_email='hello@gif-t.io',
        to_emails=email,
    )
    message.template_id = TEMPLATE_ID
    message.dynamic_template_data = {
        'reset_password_link': reset_link
    }
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(response.status_code, response.body, response.headers)
    except Exception as e:
        print(str(e))


def request_reset_password():
    data = request.get_json()
    email_data = data.get('email')

    if isinstance(email_data, dict) and 'email' in email_data:
        email = email_data['email']  # Extract the actual email string
    else:
        return jsonify({"status": "Invalid email format"}), 400

    print("Email type:", type(email))
    print("Email content:", email)

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"status": "User not found"}), 404

    try:
        reset_password_code = secrets.token_urlsafe(16)
        user.reset_password_code = reset_password_code
        db.session.commit()

        send_reset_password_email(email, reset_password_code)
        return jsonify({"status": "Reset password email sent"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "Failed to send reset password email"}), 500


def reset_user_password():
    data = request.get_json()
    reset_password_code = data.get('code')
    new_password = data.get('password')

    if not reset_password_code or not new_password:
        return jsonify({"status": "Code and password are required"}), 400

    user = User.query.filter_by(reset_password_code=reset_password_code).first()
    if not user:
        return jsonify({"status": "Invalid reset code"}), 400

    try:
        hashed_password = generate_password_hash(new_password, method='scrypt')
        user.password = hashed_password
        user.reset_password_code = None
        db.session.commit()
        return jsonify({"status": "Password reset successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "Error resetting password"}), 500