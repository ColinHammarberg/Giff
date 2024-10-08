from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from PIL import Image
from models import UserGif
import requests
import io
from models import UserGif
import boto3


s3_client = boto3.client(
        's3', 
        aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
        aws_secret_access_key='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', 
        region_name='eu-north-1'
    )

@jwt_required()
def update_gif_name():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    new_name = data.get('newName')

    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()

    if not user_gif:
        return jsonify({'error': 'GIF not found'}), 404

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


@jwt_required()
def update_gif_duration():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    new_duration = data.get('newDuration')

    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()

    if not user_gif:
        return jsonify({'error': 'GIF not found'}), 404

    bucket_name = 'gift-resources'
    gif_key = f"{user_id}/{user_gif.gif_name}"

    # Download the existing GIF
    gif_object = s3_client.get_object(Bucket=bucket_name, Key=gif_key)
    original_gif = Image.open(io.BytesIO(gif_object['Body'].read()))

    # Modify the duration of each frame
    frames = []
    try:
        while True:
            frame = original_gif.copy()
            frames.append(frame)
            original_gif.seek(original_gif.tell() + 1)
    except EOFError:
        pass  # End of the GIF sequence

    modified_frames = [frame.copy() for frame in frames]
    output_buffer = io.BytesIO()
    modified_frames[0].save(
        output_buffer, format='GIF', save_all=True, append_images=modified_frames[1:], 
        duration=new_duration, loop=0)
    output_buffer.seek(0)

    update_duration = new_duration / 1000

    user_gif.duration = update_duration
    db.session.commit()

    # Replace the existing GIF in S3
    s3_client.put_object(Bucket=bucket_name, Key=gif_key, Body=output_buffer.getvalue())
    
    presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': bucket_name,
                                                             'Key': gif_key},
                                                     ExpiresIn=3600)  # URL expiry time

    return jsonify({'message': 'GIF duration updated successfully', 'new_gif_url': presigned_url}), 200

@jwt_required()
def update_gif_frames():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    frame_urls = data.get('frameUrls')
    print('frame_urls', frame_urls)
    print('resource_id', resource_id)

    # Validate GIF
    user_gif = UserGif.query.filter_by(user_id=user_id, resourceId=resource_id).first()
    if not user_gif:
        return jsonify({'error': 'GIF not found'}), 404

    # S3 Client Setup
    bucket_name = 'gift-resources'

    # Fetch and Process New Frames
    frames = []
    for url in frame_urls:
        response = requests.get(url)
        if response.status_code == 200:
            frame = Image.open(io.BytesIO(response.content))
            frames.append(frame)

    # Create New GIF
    default_duration = 1000
    gif_duration = user_gif.duration * 1000 if user_gif.duration is not None else default_duration
    print('gif_duration', gif_duration)

    frames_with_durations = [(frame, gif_duration) for frame in frames]

    if not frames_with_durations:
        return jsonify({'error': 'No frames to process'}), 400

    output_buffer = io.BytesIO()
    frames_with_durations[0][0].save(
        output_buffer, format='GIF', save_all=True, 
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[duration for _, duration in frames_with_durations],
        loop=0
    )
    output_buffer.seek(0)

    # Update S3 and Database
    gif_key = f"{user_id}/{user_gif.gif_name}"
    s3_client.put_object(Bucket=bucket_name, Key=gif_key, Body=output_buffer.getvalue())
    
    user_gif.frame_urls = frame_urls
    db.session.commit()

    # Generate Presigned URL
    presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': bucket_name,
                                                             'Key': gif_key},
                                                     ExpiresIn=3600)

    return jsonify({'message': 'GIF updated successfully', 'new_gif_url': presigned_url}), 200