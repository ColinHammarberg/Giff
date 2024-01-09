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
        print('include_ai_value', include_ai_value)
        
        if isinstance(include_ai_value, bool):
            user.include_ai = include_ai_value
            db.session.commit()
            return jsonify({"status": "success", "data": user.include_ai}), 200
        else:
            return jsonify({"status": "error", "message": "Invalid value for include_ai"}), 400

    else:
        return jsonify({"status": "error", "message": "User not found"}), 404

@jwt_required()
def include_ai_email():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    data = request.get_json()
    print('data', data)
    if user:
        include_example_email = data.get('include_example_email', {}).get('includeExampleEmail')
        print('include_example_email', include_example_email)
        user.include_example_email = include_example_email
        db.session.commit()
        return jsonify({"status": "success", "data": user.include_example_email}), 200
    else:
        return jsonify({"status": False, "message": "User not found"}), 404