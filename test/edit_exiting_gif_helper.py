from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import UserGif
import boto3

@jwt_required()
def update_gif_name():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    new_name = data.get('newName')

    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()

    if not user_gif:
        return jsonify({'error': 'GIF not found'}), 404

    s3_client = boto3.client(
        's3', 
        aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
        aws_secret_access_key='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', 
        region_name='eu-north-1'
    )

    bucket_name = 'gift-resources'
    old_key = f"{user_id}/{user_gif.gif_name}"
    new_key = f"{user_id}/{new_name}"

    s3_client.copy_object(Bucket=bucket_name, CopySource={'Bucket': bucket_name, 'Key': old_key}, Key=new_key)
    s3_client.delete_object(Bucket=bucket_name, Key=old_key)

    user_gif.gif_name = new_name
    db.session.commit()

    return jsonify({'message': 'GIF name updated successfully', "data": new_name}), 200

@jwt_required()
def update_example_email():
    data = request.get_json()
    resource_id = data.get('resourceId')
    new_example_email = data.get('exampleEmail')

    user_id = get_jwt_identity()

    gif = UserGif.query.filter_by(resourceId=resource_id, user_id=user_id).first()
    if gif is None:
        return jsonify({'error': 'GIF not found or access denied'}), 404

    gif.example_email = new_example_email
    db.session.commit()

    return jsonify({'message': 'Example email updated successfully'})