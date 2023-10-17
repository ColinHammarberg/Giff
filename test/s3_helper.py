import boto3
from flask import jsonify, request
from models import UserGif
from flask_jwt_extended import jwt_required, get_jwt_identity


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
    user_gifs = UserGif.query.filter_by(user_id=user_id).order_by(UserGif.created_at.desc()).all()
    print('user_gifs', user_gifs)
    s3_client = s3
    bucket_name = 'gift-resources'

    gifs_list = []
    for gif in user_gifs:
        presigned_url = s3_client.generate_presigned_url('get_object',
                                                         Params={'Bucket': bucket_name,
                                                                 'Key': f"{user_id}/{gif.gif_name}"},
                                                         ExpiresIn=3600)  # URL expires in 1 hour
        gifs_list.append({"name": gif.gif_name, "url": presigned_url, "resourceId": gif.resourceId, "selectedColor": gif.selectedColor, "created_at": gif.created_at})

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
        gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id, gif_name=gif_name).first()

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




    

