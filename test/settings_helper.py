from flask import jsonify, request
from extensions import db
from models import User
from flask_jwt_extended import jwt_required, get_jwt_identity

# Save settings to user endpoint
@jwt_required()
def save_user_resolution():
    data = request.get_json()
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    try:
        # Assuming that you have a column in your user model to store the resolution
        current_user.selected_resolution = data['selectedResolution']
        db.session.commit()
        return jsonify({"status": "Settings updated successfully"}), 200
    except Exception as e:
        # Handle exceptions
        return jsonify({"status": "Internal Server Error"}), 500
