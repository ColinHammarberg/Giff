from flask import jsonify, request
from extensions import db
from models import User, UserLogo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from s3_helper import upload_to_s3
import uuid
import os

# Fetch user info endpoint

@jwt_required()
def fetch_user_info():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if current_user:
        return jsonify(
            id=current_user.id,
            email=current_user.email,
            password=current_user.password,
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
        print('successfully created', db.session)
    except Exception as e:
        print("Commit failed:", e)
    db.session.rollback()
    access_token = create_access_token(identity=new_user.id)
    print('new_user.id', new_user.id)
    return jsonify(access_token=access_token, status="Signup successful"), 200

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
