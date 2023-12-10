from flask import jsonify, request
from extensions import db
from models import User, UserLogo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from verify_account_helper import send_verification_email
import secrets
import boto3

# Fetch user info endpoint

@jwt_required()
def fetch_user_info():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if current_user:
        db.session.refresh(current_user) # Refresh to get the latest data
        user_logo = UserLogo.query.filter_by(user_id=user_id).first()
        s3 = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                  aws_secret_access_key='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', region_name='eu-north-1')
        presigned_url = None
        if user_logo:
            resource_id = user_logo.resource_id
            folder_name = f"{user_id}/logos/"
            presigned_url = s3.generate_presigned_url('get_object',
                                                     Params={'Bucket': 'logo-resources',
                                                             'Key': f"{folder_name}{resource_id}.png"},
                                                     ExpiresIn=3600)  # URL expires in 1 hour
        return jsonify(
            id=current_user.id,
            email=current_user.email,
            password=current_user.password,
            resolution=current_user.selected_resolution,
            is_active=current_user.is_active,
            logo_url=presigned_url,
            has_logo=current_user.has_logo,
            include_logo=current_user.include_logo,
            include_ai=current_user.include_ai,
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
VERIFICATION_URL = 'https://giveagif-t.com/verify'
SENDGRID_API_KEY = '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'

def signup():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": "Missing required fields"}), 400
    
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"status": "Email already exists"}), 409
    
    hashed_password = generate_password_hash(data['password'], method='sha256')

    # Generate a unique verification code
    verify_account_code = secrets.token_urlsafe(16)

    new_user = User(email=data['email'], password=hashed_password, verify_account_code=verify_account_code)
    db.session.add(new_user)
    
    try:
        db.session.commit()
        send_verification_email(new_user.email, verify_account_code)
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
def include_logo_in_gifs():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if user:
        # Toggle the include_logo value
        user.include_logo = not user.include_logo
        db.session.commit()
        return jsonify({"status": "success", "data": user.include_logo}), 200
    else:
        return jsonify({"status": False, "message": "User not found"}), 404
    

    
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
