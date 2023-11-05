import boto3
from flask import jsonify, request
from models import UserGif, UserLogo, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
import os
import uuid

s3 = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
                  aws_secret_access_key='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', region_name='eu-north-1')


def upload_to_s3(file_name, bucket, object_name=None, resource_id=None):
    print('file_name', file_name)
    try:
        s3.upload_file(
            file_name,
            bucket,
            object_name or file_name,
            ExtraArgs={
                'Metadata': {'resourceId': resource_id}
            }
        )
    except Exception as e:
        print(f"Upload Failed: {e}")
        return False
    return True


@jwt_required()
def fetch_user_gifs():
    user_id = get_jwt_identity()
    print('user_id', user_id)
    if user_id is None:
        return jsonify({'error': 'User not authenticated'}), 401

    # Fetch user GIFs from the database in descending order of creation date
    user_gifs = UserGif.query.filter_by(
        user_id=user_id).order_by(UserGif.created_at.desc()).all()
    print('user_gifs', user_gifs)
    s3_client = s3
    bucket_name = 'gift-resources'

    gifs_list = []
    for gif in user_gifs:
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': bucket_name,
                                                                 'Key': f"{user_id}/{gif.gif_name}"},
                                                         ExpiresIn=3600)  # URL expires in 1 hour
        gifs_list.append({"name": gif.gif_name, "url": presigned_url, "resourceId": gif.resourceId,
                         "selectedColor": gif.selectedColor, "created_at": gif.created_at})

    return jsonify({'message': 'Success', 'data': gifs_list}), 200


@jwt_required()
def get_multiple_gifs():
    user_id = get_jwt_identity()

    if user_id is None:
        return jsonify({'error': 'User not authenticated'}), 401

    data = request.get_json()
    print('data', data)
    gif_requests = data.get('gifs', [])

    if not gif_requests:
        return jsonify({'error': 'No GIFs requested'}), 400

    s3_client = s3
    bucket_name = 'gift-resources'

    gifs_list = []

    for gif_request in gif_requests:
        resource_id = gif_request.get('resourceId')
        gif_name = gif_request.get('name')

        if not resource_id or not gif_name:
            return jsonify({'error': 'Invalid GIF request format'}), 400

        # Fetch the specific GIF from the database
        gif = UserGif.query.filter_by(
            user_id=user_id, resourceId=resource_id, gif_name=gif_name).first()

        if gif is None:
            return jsonify({'error': 'GIF not found'}), 404

        # Generate a presigned URL for the specific GIF
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': bucket_name,
                                                                 'Key': f"{user_id}/{gif.gif_name}"},
                                                         ExpiresIn=3600)  # URL expires in 1 hour

        gif_data = {
            "name": gif.gif_name,
            "url": presigned_url,
            "resourceId": gif.resourceId,
            "selectedColor": gif.selectedColor,
            "created_at": gif.created_at
        }

        gifs_list.append(gif_data)

    return jsonify({'message': 'Success', 'data': gifs_list}), 200


@jwt_required()
def fetch_logo():
    user_id = get_jwt_identity()
    if user_id is None:
        return jsonify({'error': 'User not authenticated'}), 401

    user_logo = UserLogo.query.filter_by(user_id=user_id).first()

    if user_logo is None:
        return jsonify({'error': 'Logo not found for this user'}), 404

    resource_id = user_logo.resource_id

    folder_name = f"{user_id}/logos/"

    # Generate a presigned URL to access the logo
    presigned_url = s3.generate_presigned_url('get_object',
                                              Params={'Bucket': 'logo-resources',
                                                      'Key': f"{folder_name}{resource_id}.png"},
                                              ExpiresIn=3600)  # URL expires in 1 hour

    return jsonify({'message': 'Success', 'logo_url': presigned_url}), 200


@jwt_required()
def delete_logo():
    user_id = get_jwt_identity()

    if user_id is None:
        return jsonify({'error': 'User not authenticated'}), 401

    user_logo = UserLogo.query.filter_by(user_id=user_id).first()

    if user_logo is None:
        return jsonify({'error': 'Logo not found for this user'}), 404

    resource_id = user_logo.resource_id
    folder_name = f"{user_id}/logos/"
    # Delete the logo from the S3 bucket
    try:
        s3.delete_object(Bucket='logo-resources',
                         Key=f"{folder_name}{resource_id}.png")
    except Exception as e:
        return jsonify({'error': f'Failed to delete logo from S3: {str(e)}'}), 500

    # Delete the logo entry from the database
    db.session.delete(user_logo)
    db.session.commit()

    return jsonify({'message': 'Logo deleted successfully'}), 200


@jwt_required()
def upload_logo():
    user_id = get_jwt_identity()
    logo_data = {}

    user_exists = User.query.filter_by(id=user_id).first()

    if not user_exists and user_id:
        return jsonify({'error': f'User with id {user_id} not found'}), 400

    # Check if a logo file is provided in the request
    if 'logo' not in request.files:
        return jsonify({'error': 'No logo file provided'}), 400

    logo_file = request.files['logo']

    if logo_file.filename == '':
        return jsonify({'error': 'Empty logo file provided'}), 400

    # Generate a unique resource ID for the logo
    resource_id = str(uuid.uuid4())

    # Define the folder structure in your S3 bucket (if needed)
    folder_name = f"{user_id}/logos/"

    # Save the logo file to a temporary directory on your server
    temp_dir = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'temp_logos')
    os.makedirs(temp_dir, exist_ok=True)
    temp_logo_path = os.path.join(temp_dir, f'{resource_id}.png')
    logo_file.save(temp_logo_path)

    # Upload the logo to S3
    upload_to_s3(temp_logo_path, 'logo-resources',
                 f"{folder_name}{resource_id}.png", resource_id)

    logo_url = s3.generate_presigned_url('get_object',
                                         Params={'Bucket': 'logo-resources',
                                                 'Key': f"{folder_name}{resource_id}.png"},
                                         ExpiresIn=3600)  # URL expires in 1 hour

    # Store logo metadata in the user database
    if user_exists:
        # Database Entry Here
        db.session.add(UserLogo(user_id=user_id, resource_id=resource_id))
        db.session.commit()

    logo_data = {
        "resource_id": resource_id,
    }

    # Clean up: Delete the temporary logo file
    os.remove(temp_logo_path)

    return jsonify({'message': 'Logo uploaded!', 'resource_id': logo_data, 'logo_url': logo_url})


@jwt_required()
def delete_gif():
    try:
        # Get user ID from JWT token
        user_id = get_jwt_identity()

        if user_id is None:
            return jsonify({'error': 'User not authenticated'}), 401

        # Get data from JSON request
        data = request.get_json()
        gif_name = data.get('name')
        resource_id = data.get('resourceId')

        if not gif_name or not resource_id:
            return jsonify({'error': 'Bad request: Missing name or resourceId'}), 400

        # Fetch the GIF from the database
        gif = UserGif.query.filter_by(
            user_id=user_id, resourceId=resource_id, gif_name=gif_name).first()

        if gif is None:
            return jsonify({'error': 'GIF not found'}), 404
        
        bucket_name = 'gift-resources'

        # Delete GIF from S3
        s3.delete_object(Bucket=bucket_name, Key=f"{user_id}/{gif_name}")

        # Delete GIF from database
        db.session.delete(gif)
        db.session.commit()

        return jsonify({'message': 'GIF successfully deleted'}), 200

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500
