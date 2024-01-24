from models import UserGif
from extensions import db
from flask import redirect

def track_gif_click(gif_id):
    # Find the UserGif entry by ID
    print('gif_id', gif_id)
    user_gif = UserGif.query.filter_by(id=gif_id).first()
    print('user_gif', user_gif)

    if user_gif:
        # Increment the click count
        user_gif.click_count += 1
        db.session.commit()

        # Redirect to the actual GIF URL
        return redirect(user_gif.gif_url)
    else:
        # Handle case where GIF does not exist
        return "GIF not found", 404