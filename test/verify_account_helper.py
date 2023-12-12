from extensions import db
from sendgrid.helpers.mail import Mail
from sendgrid import SendGridAPIClient
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
import secrets

VERIFICATION_URL = 'https://giveagif-t.com/verify'
SENDGRID_API_KEY = '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'


def send_verification_email(email, verify_account_code):
    verification_link = f"{VERIFICATION_URL}?code={verify_account_code}"
    TEMPLATE_ID = 'd-3b5e54e9b21448168495f8b68919a8fa'
    message = Mail(
        from_email='hello@gif-t.io',
        to_emails=email,
    )
    message.template_id = TEMPLATE_ID
    message.dynamic_template_data = {
        'gift_verification_link': verification_link
    }
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(response.status_code, response.body, response.headers)
    except Exception as e:
        print(str(e))


def verify():
    verify_account_code = request.args.get('code')
    if verify_account_code is None:
        return jsonify({"status": "Verification code wasn't found"}), 404
    user = User.query.filter_by(
        verify_account_code=verify_account_code).first()
    if user:
        user.is_active = True
        user.verify_account_code = None
        db.session.commit()
        return jsonify({"status": "Email verified successfully"}), 200
    else:
        return jsonify({"status": "Invalid verification code"}), 404


@jwt_required()
def send_verification_email_again():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    if not current_user:
        return jsonify({"status": "User not found"}), 404

    try:
        # Generate a unique verification code
        verify_account_code = secrets.token_urlsafe(16)
        current_user.verify_account_code = verify_account_code
        db.session.commit()

        send_verification_email(current_user.email, verify_account_code)
        return jsonify({"status": "Sent new email verification link"}), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "Failed to send verification email"}), 500
