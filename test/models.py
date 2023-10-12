from extensions import db
from flask_login import UserMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    gifs = relationship("UserGif", backref="user")

class UserGif(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    gif_name = db.Column(db.String)
    gif_url = db.Column(db.String)
    resourceId = db.Column(db.String, unique=True)
    selectedColor = db.Column(db.String)
    user = db.relationship('User', back_populates='gifs')

User.gifs = db.relationship('UserGif', back_populates='user')
