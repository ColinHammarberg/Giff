from flask import Flask, request, jsonify
import requests
from models import User
from extensions import db
from flask_jwt_extended import create_access_token

def google_user_signin():
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
    authorization_code = data.get('token')
    print('authorization_code', authorization_code)

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        'client_id': '9c954b52-98e9-45b7-a5ed-da61c3048204',
        'scope': 'openid profile User.Read',
        'code': authorization_code,
        'redirect_uri': 'https://giveagif-t.com',
        'grant_type': 'authorization_code',
        'client_secret': '6dfa8b1e-b981-4ea4-bac3-72a1509103c2'
    }
    microsoft_info = requests.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', headers=headers, data=data)

    print('microsoft_info', microsoft_info)

    if microsoft_info.status_code != 200:
        return jsonify({"status": "Invalid Microsoft token", "details": microsoft_info.json()}), 400

    user_info = microsoft_info.json()
    # Extract user email from the ID token, additional decoding might be needed
    user_email = user_info.get('email')

    existing_user = User.query.filter_by(email=user_email).first()
    if existing_user:
        return jsonify({"status": "User already exists"}), 409

    new_user = User(email=user_email)
    db.session.add(new_user)
    
    try:
        db.session.commit()
        access_token = create_access_token(identity=new_user.id)
        return jsonify(access_token=access_token, status="Signup successful"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Signup failed", "message": str(e)}), 500