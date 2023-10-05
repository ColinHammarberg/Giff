from flask import jsonify, request
from extensions import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity

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
