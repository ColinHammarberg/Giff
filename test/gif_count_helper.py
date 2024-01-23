from models import GifCounter
from flask import jsonify

def get_gif_count():
    counter = GifCounter.query.first()
    count = counter.count if counter else 0
    return jsonify({"gif_count": count})