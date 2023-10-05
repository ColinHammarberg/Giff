import boto3
from flask_login import current_user
from flask import jsonify
from models import UserGif

s3 = boto3.client('s3', aws_access_key_id='AKIA4WDQ522RD3AQ7FG4',
    aws_secret_access_key='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', region_name='eu-north-1')

def upload_to_s3(file_name, bucket, object_name=None, resource_id=None):
    print('resource_id1', resource_id)
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
    
def get_gif(gif_name):
    if current_user.is_authenticated:
        user_id = current_user.id
    else:
        return jsonify({"status": "Not Authenticated"}), 401
    
    user_gif = UserGif.query.filter_by(user_id=user_id, gif_name=gif_name).first()
    if user_gif:
        return jsonify({"gif_url": user_gif.gif_url}), 200
    else:
        return jsonify({"status": "GIF not found"}), 404

def fetch_from_s3(file_name, bucket, resource_id):
    try:
        s3.download_file(bucket, file_name, file_name)
    except Exception as e:
        print(f"Download Failed: {e}")
        return False
    return True
