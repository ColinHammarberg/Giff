from models import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from extensions import db
from flask import jsonify

@jwt_required()
def include_ai_in_gifs():
    user_id = get_jwt_identity()
    data = request.get_json()
    user = User.query.filter_by(id=user_id).first()

    if user:
        # Extract the boolean value from the nested dictionary
        include_ai_value = data.get('include_ai', {}).get('includeAI')
        
        if isinstance(include_ai_value, bool):
            user.include_ai = include_ai_value
            db.session.commit()
            return jsonify({"status": "success", "data": user.include_ai}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid value for include_ai"}), 400

    else:
        return jsonify({"status": "error", "message": "User not found"}), 404

@jwt_required()
def add_watermark():
    user_id = get_jwt_identity()
    data = request.get_json()
    user = User.query.filter_by(id=user_id).first()

    if user:
        # Directly get the boolean value for add_watermark
        add_watermark = data.get('add_watermark')

        # Ensure add_watermark is a boolean before proceeding
        if isinstance(add_watermark, bool):
            user.watermark = add_watermark
            db.session.commit()
            return jsonify({"status": "success", "data": {"watermark": user.watermark}}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid value for add_watermark"}), 400
@jwt_required()
def include_ai_email():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    data = request.get_json()
    if user:
        include_example_email = data.get('include_example_email', {}).get('includeExampleEmail')
        user.include_example_email = include_example_email
        db.session.commit()
        return jsonify({"status": "success", "data": user.include_example_email}), 200
    else:
        return jsonify({"status": False, "message": "User not found"}), 404