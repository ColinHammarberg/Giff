from flask import jsonify, request
from extensions import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from sendgrid.helpers.mail import Mail
from sendgrid import SendGridAPIClient
import secrets

# Fetch user info endpoint

@jwt_required()
def fetch_user_info():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if current_user:
        db.session.refresh(current_user) # Refresh to get the latest data
        return jsonify(
            id=current_user.id,
            email=current_user.email,
            password=current_user.password,
            resolution=current_user.selected_resolution,
            is_active=current_user.is_active,
            # has_logo=current_user.has_logo,
            status="Success"
        ), 200
    else:
        return jsonify({"status": "User not found"}), 404

def signin():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": "Missing required fields"}), 400
    print('Email:', data['email'])
    user = User.query.filter_by(email=data['email']).first()
    print('User:', user)
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, status="Login successful"), 200
    return jsonify({"status": "Login failed"}), 401

@jwt_required()
def keep_access_alive():
    current_user = get_jwt_identity()
    # Extend the expiration time of the current access token
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200

# Signup endpoint
serializer_secret_key = secrets.token_urlsafe(32)
SERIALIZER_SECRET_KEY = serializer_secret_key
VERIFICATION_URL = 'https://giveagif-t.com/verify'
SENDGRID_API_KEY = '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'

s = URLSafeTimedSerializer(SERIALIZER_SECRET_KEY)

def send_verification_email(email, token):
    verification_link = f"{VERIFICATION_URL}?token={token}"
    print('verification_link', verification_link, email, token)
    TEMPLATE_ID = 'd-cea95aa2f8dc4caaa7ca8b1cb5d87520'
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
    token = request.args.get('token')
    try:
        email = s.loads(token, salt='email-confirm-salt', max_age=3600)
    except SignatureExpired:
        return jsonify({"status": "Verification link expired"}), 400
    except BadSignature:
        return jsonify({"status": "Invalid verification link"}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        user.is_active = True
        db.session.commit()
        db.session.refresh(user)
        return jsonify({"status": "Email verified successfully"}), 200
    else:
        return jsonify({"status": "User not found"}), 404

def signup():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": "Missing required fields"}), 400
    
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"status": "Email already exists"}), 409
    
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(email=data['email'], password=hashed_password)
    db.session.add(new_user)
    
    try:
        db.session.commit()
        # User successfully created, now send a verification email
        token = s.dumps(new_user.email, salt='email-confirm-salt')
        send_verification_email(new_user.email, token)
        access_token = create_access_token(identity=new_user.id)
        return jsonify(access_token=access_token, status="Signup successful"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Signup failed", "message": str(e)}), 500

# Signout user endpoint


def signout():
    try:
        # Invalidate token on client-side.
        return jsonify({"status": "Signed out"}), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"status": "Internal Server Error"}), 500

# Delete user endpoint

@jwt_required()
def delete_user_profile():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    if not current_user:
        return jsonify({"status": "User not found"}), 404

    db.session.delete(current_user)
    try:
        db.session.commit()
        return jsonify({"status": "Profile deleted"}), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        db.session.rollback()
        return jsonify({"status": "Internal Server Error"}), 500


@jwt_required()
def update_password():
    data = request.get_json()
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    print(f"Current user: {current_user.password}")
    try:
        if not check_password_hash(current_user.password, data['currentPassword']):
            return jsonify({"status": "Incorrect current password"}), 401
        # Fallback to 'sha256'
        new_password_hash = generate_password_hash(data['newPassword'], method='sha256')
        print('new_password_hash', new_password_hash)
        current_user.password = new_password_hash
        db.session.commit()
        return jsonify({"status": "Password updated successfully"}), 200
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"status": "Internal Server Error"}), 500
    
@jwt_required()
def update_email():
    data = request.get_json()
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    print(f"Current user: {current_user.email}")
    try:
        if not check_password_hash(current_user.password, data['password']):
            return jsonify({"status": "Incorrect current password"}), 401
        
        new_email = data['newEmail']
        current_user.email = new_email
        db.session.commit()
        return jsonify({"status": "Email updated successfully"}), 200
        
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"status": "Internal Server Error"}), 500
