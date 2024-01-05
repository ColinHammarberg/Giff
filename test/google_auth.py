from flask import Flask, request, jsonify
import requests
from models import User
from extensions import db
from flask_jwt_extended import create_access_token
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import jwt

def google_user_signin():
    data = request.get_json()
    token = data.get('token')
    CLIENT_ID = '780954759358-cqnev3bau95uvbk80jltofofr4qc4m38.apps.googleusercontent.com'

    # Verify the token with Google
    print('token', token)
    idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
    print('idinfo', idinfo)

    user_email = idinfo['email']
    print('idinfo', user_email)
    # Check if user already exists
    existing_user = User.query.filter_by(email=user_email).first()
    if existing_user:
        # Generate a token for the existing user
        access_token = create_access_token(identity=existing_user.id)
        return jsonify(access_token=access_token, status="Signin successful"), 200
    else:
        return jsonify({"status": "User does not exist"}), 404

def google_user_signup():
    data = request.get_json()
    google_token = data.get('token')

    # Verify the token with Google
    google_info = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}")
    if google_info.status_code != 200:
        return jsonify({"status": "Invalid Google token"}), 400

    user_info = google_info.json()
    user_email = user_info.get('email')

    # Check if user already exists
    existing_user = User.query.filter_by(email=user_email).first()
    if existing_user:
        return jsonify({"status": "User already exists"}), 409

    # Create a new user
    new_user = User(email=user_email)  # Add other fields as necessary
    db.session.add(new_user)
    
    try:
        db.session.commit()
        # Generate a token for the new user
        access_token = create_access_token(identity=new_user.id)
        return jsonify(access_token=access_token, status="Signup successful"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Signup failed", "message": str(e)}), 500
    
def outlook_user_signup():
    data = request.get_json()
    access_token = data.get('token')

    try:
        # Decode token without verification
        decoded_token = jwt.decode(access_token, options={"verify_signature": False})
        print('decoded_token', decoded_token)
        user_email = decoded_token.get('unique_name')
        print('user_email', user_email)
    except jwt.PyJWTError as e:
        # Handle any decoding errors
        return jsonify({"status": "Token decoding error", "message": str(e)}), 400

    # Check if user exists or create a new user
    existing_user = User.query.filter_by(email=user_email).first()
    if existing_user:
        return jsonify({"status": "User already exists"}), 409

    new_user = User(email=user_email)
    print('user_email', new_user)
    db.session.add(new_user)
    
    try:
        db.session.commit()
        access_token = create_access_token(identity=new_user.id)
        return jsonify(access_token=access_token, status="Signup successful"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Signup failed", "message": str(e)}), 500
    
def outlook_user_signin():
    data = request.get_json()
    access_token = data.get('token')

    try:
        # Decode token without verification
        decoded_token = jwt.decode(access_token, options={"verify_signature": False})
        user_email = decoded_token.get('unique_name')
    except jwt.PyJWTError as e:
        return jsonify({"status": "Token decoding error", "message": str(e)}), 400

    existing_user = User.query.filter_by(email=user_email).first()
    if existing_user:
        access_token = create_access_token(identity=existing_user.id)
        return jsonify(access_token=access_token, status="Signin successful"), 200
    else:
        return jsonify({"status": "User does not exist"}), 404
