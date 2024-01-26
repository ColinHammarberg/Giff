from models import UserGif
from extensions import db
from flask import request, jsonify

def track_gif_click():
    # Find the UserGif entry by ID
    data = request.get_json()
    gif_id = data.get('gif_id')
    print('gif_id', gif_id)
    print('data', data)
    user_gif = UserGif.query.filter_by(id=gif_id).first()

    if user_gif:
        # Increment the click count
        user_gif.click_count += 1
        db.session.commit()

        return jsonify({'verified': user_gif.source})
    else:
        # Handle case where GIF does not exist
        return "GIF not found", 404