from extensions import db
from flask_login import UserMixin
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    selected_resolution = db.Column(db.String(120), default=None, nullable=True)
    gifs = relationship("UserGif", backref="user")
    logos = relationship("UserLogo", backref="user")

class UserGif(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    gif_name = db.Column(db.String)
    gif_url = db.Column(db.String)
    resourceId = db.Column(db.String, unique=True)
    selectedColor = db.Column(db.String)
    user = db.relationship('User', back_populates='gifs')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserLogo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    resource_id = db.Column(db.String, unique=True)
    user = db.relationship('User', back_populates='logos')

User.gifs = db.relationship('UserGif', back_populates='user')
User.logos = db.relationship('UserLogo', back_populates='user')
