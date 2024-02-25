from flask import jsonify, request
from extensions import db
from models import User, UserLogo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from bcrypt import hashpw, gensalt
from flask_jwt_extended import jwt_required, get_jwt_identity
from verify_account_helper import send_verification_email
import secrets
import boto3

# Fetch user info endpoint

s3 = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                  aws_secret_access_key='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', region_name='eu-north-1')

def signup_new_user():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": "Missing required fields"}), 400
    
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"status": "Email already exists"}), 409
    
    hashed_password = hashpw(data["password"].encode(), gensalt())
    verify_account_code = secrets.token_urlsafe(16)
    new_user = User(email=data['email'], password=hashed_password, verify_account_code=verify_account_code)
    db.session.add(new_user)
    
    try:
        db.session.commit()
        # Attempt to send the verification email
        send_verification_email(new_user.email, verify_account_code)
        access_token = create_access_token(identity=new_user.id)  # Assuming this function correctly generates an access token
        # Return a successful signup response
        return jsonify(access_token=access_token, status="Signup successful"), 200
    except Exception as e:
        db.session.rollback()
        # If an exception occurs, log it and return a generic error message
        error_message = f"Signup failed due to an internal error: {str(e)}"
        print(error_message)
        return jsonify({"status": "Signup failed", "message": "An internal error occurred. Please try again."}), 500

@jwt_required()
def fetch_user_info():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if current_user:
        db.session.refresh(current_user)

        user_tags = [{'id': tag.id, 'value': tag.tag_value, 'color': tag.color} for tag in current_user.tags]
        user_logo = UserLogo.query.filter_by(user_id=user_id).first()
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
            watermark=current_user.watermark,
            has_logo=current_user.has_logo,
            organization=current_user.organization,
            country=current_user.country,
            include_logo=current_user.include_logo,
            include_ai=current_user.include_ai,
            include_example_email=current_user.include_example_email,
            tags=user_tags,
            status="Success"
        ), 200
    else:
        return jsonify({"status": "User not found"}), 404

def signin():
    data = request.get_json()
    if 'email' not in data or 'password' not in data:
        return jsonify({"status": "Missing required fields"}), 400
    user = User.query.filter_by(email=data['email']).first()
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

VERIFICATION_URL = 'https://giveagif-t.com/verify'
SENDGRID_API_KEY = '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'

# Signout user endpoint

def signout():
    try:
        # Invalidate token on client-side.
        return jsonify({"status": "Signed out"}), 200
    except Exception as e:
        return jsonify({"status": "Internal Server Error"}), 500

# Delete user endpoint

@jwt_required()
def delete_user_profile():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)

    if not current_user:
        return jsonify({"status": "User not found"}), 404

    # Configure S3 client
    bucket_name = 'gift-resources'

    # Define the user's folder in the S3 bucket
    user_folder = f"{user_id}/"

    try:
        objects_to_delete = s3.list_objects_v2(Bucket=bucket_name, Prefix=user_folder)

        if 'Contents' in objects_to_delete:
            delete_keys = {'Objects': [{'Key': obj['Key']} for obj in objects_to_delete['Contents']]}
            s3.delete_objects(Bucket=bucket_name, Delete=delete_keys)

        db.session.delete(current_user)
        db.session.commit()

        return jsonify({"status": "Profile and associated GIFs deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Internal Server Error"}), 500


@jwt_required()
def update_password():
    data = request.get_json()
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    try:
        if not check_password_hash(current_user.password, data['currentPassword']):
            return jsonify({"status": "Incorrect current password"}), 401
        # Fallback to 'sha256'
        new_password_hash = generate_password_hash(data['newPassword'], method='sha256')
        current_user.password = new_password_hash
        db.session.commit()
        return jsonify({"status": "Password updated successfully"}), 200
    except Exception as e:
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
    try:
        new_email = data['newEmail']
        current_user.email = new_email
        db.session.commit()
        return jsonify({"status": "Email updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"status": "Internal Server Error"}), 500
    
@jwt_required()
def update_additional_profile():
    data = request.get_json()
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    try:
        country = data['country']
        company = data['company']
        if country is not None:
            current_user.country = country
        if company is not None:
            current_user.organization = company
        db.session.commit()
        return jsonify({"status": "Profile updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"status": "Internal Server Error"}), 500
