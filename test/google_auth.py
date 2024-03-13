from flask import Flask, request, jsonify
import requests
from models import User
from extensions import db
from flask_jwt_extended import create_access_token
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import jwt

def login_with_email():
    data = request.get_json()
    user_email = data.get('email')

    # Check if user already exists
    user = User.query.filter_by(email=user_email).first()
    if user:
        # User exists, generate a token
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, status="Login successful"), 200
    else:
        # User doesn't exist, create a new one
        try:
            user = User(email=user_email, is_active=True)
            db.session.add(user)
            db.session.commit()

            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token, status="Login successful"), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "Error creating user", "message": str(e)}), 500
        
def login_with_gmail_email():
    data = request.get_json()
    user_email = data.get('email')

    # Check if user already exists
    user = User.query.filter_by(email=user_email).first()
    if user:
        # User exists, generate a token
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, status="Login successful"), 200
    else:
        # User doesn't exist, create a new one
        try:
            return jsonify(status="Login unsuccessful"), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "Error creating user", "message": str(e)}), 500
        
def signin_with_email_outlook():
    data = request.get_json()
    user_email = data.get('email')
    print("user_email", user_email)
    # Check if user already exists 
    user = User.query.filter_by(email=user_email).first()
    print("user", user)
    try:
        if user:
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token, status="Login successful"), 200
    except Exception as e:
        # User doesn't exist, send exception
        return jsonify({"status": "Error login user", "message": str(e)}), 500

def exchange_code_for_token(code):
    token_endpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "client_id": "9c954b52-98e9-45b7-a5ed-da61c3048204",
        "scope": "https://graph.microsoft.com/.default",
        "code": code,
        "redirect_uri": "https://giveagif-t.com",
        "grant_type": "authorization_code",
        "client_secret": "6dfa8b1e-b981-4ea4-bac3-72a1509103c2",
    }

    response = requests.post(token_endpoint, headers=headers, data=data)
    response_data = response.json()
    
    if response.status_code == 200:
        return response_data["access_token"], response_data.get("refresh_token")
    else:
        raise Exception(f"Error exchanging code for token: {response_data}")

def oauth_signin():
    code = request.json.get('code')
    if not code:
        return jsonify({"error": "Code is required"}), 400

    access_token = exchange_code_for_token(code)

    return jsonify({"status": "Access token verified", "access_token": access_token}), 200

def get_user_email():
    data = request.get_json()
    google_token = data.get('token')

    # Verify the token with Google
    google_info = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}")
    if google_info.status_code != 200:
        return jsonify({"status": "Invalid Google token"}), 400

    user_info = google_info.json()
    user_email = user_info.get('email')

    return jsonify(email=user_email), 200

def verify_google_token(google_token):
    google_info = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}")
    if google_info.status_code != 200:
        return None
    return google_info.json()

def google_user_signin():
    data = request.get_json()
    token_object = data.get('token')
    CLIENT_ID = '780954759358-cqnev3bau95uvbk80jltofofr4qc4m38.apps.googleusercontent.com'

    # Verify the token with Google
    if isinstance(token_object, dict) and 'token' in token_object:
        actual_token = token_object['token']
    else:
        return jsonify({"status": "Invalid token format"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(actual_token, google_requests.Request(), CLIENT_ID)
        user_email = idinfo['email']

        # Check if user already exists
        user = User.query.filter_by(email=user_email).first()
        if user:
            # Set the user as active if they aren't already
            user.is_active = True
        else:
            # Create a new user since one doesn't exist and set as active
            user = User(email=user_email, is_active=True)
            db.session.add(user)

        db.session.commit()

        # Generate a token for the user
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, status="Signin successful"), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "Error processing your request", "message": str(e)}), 500


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

def outlook_user_signin_or_signup():
    data = request.get_json()
    access_token = data.get('token')

    try:
        decoded_token = jwt.decode(access_token, options={"verify_signature": False})
        user_email = decoded_token.get('unique_name')
    except jwt.PyJWTError as e:
        return jsonify({"status": "Token decoding error", "message": str(e)}), 400

    # Check if the user exists in the database
    user = User.query.filter_by(email=user_email).first()

    if user:
        user.is_active = True
        db.session.commit()
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, status="Signin successful"), 200
    else:
        # User doesn't exist, so create a new user and then log them in
        new_user = User(email=user_email, is_active=True)
        db.session.add(new_user)

        try:
            db.session.commit()
            access_token = create_access_token(identity=new_user.id)
            return jsonify(access_token=access_token, status="Signup successful"), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "Signup failed", "message": str(e)}), 500
