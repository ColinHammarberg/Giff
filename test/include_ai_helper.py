from models import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from flask import jsonify

@jwt_required()
def include_ai_in_gifs():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if user:
        # Toggle the include_ai value
        user.include_ai = not user.include_ai
        db.session.commit()
        return jsonify({"status": "success", "data": user.include_ai}), 200
    else:
        return jsonify({"status": False, "message": "User not found"}), 404
    
@jwt_required()
def include_ai_email():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if user:
        # Toggle the include_ai value
        user.include_example_email = not user.include_example_email
        db.session.commit()
        return jsonify({"status": "success", "data": user.include_example_email}), 200
    else:
        return jsonify({"status": False, "message": "User not found"}), 404