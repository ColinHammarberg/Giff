from extensions import db
from flask_login import UserMixin
from sqlalchemy import ForeignKey, ARRAY, String
from sqlalchemy.orm import relationship
from datetime import datetime



class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tag_value = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    user = db.relationship('User', back_populates='tags')
    gifs = db.relationship(
        'UserGif', secondary='tag_association', back_populates='tags')


tag_association = db.Table('tag_association',
                           db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True),
                           db.Column('user_gif_id', db.Integer, db.ForeignKey('user_gif.id'), primary_key=True))
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(512))
    is_active = db.Column(db.Boolean, default=False)
    selected_resolution = db.Column(
        db.String(120), default=None, nullable=True)
    has_logo = db.Column(db.Boolean, default=False)
    include_logo = db.Column(db.Boolean, default=False)
    country = db.Column(db.String(120))
    organization = db.Column(db.String(120))
    watermark = db.Column(db.Boolean, default=False)
    include_ai = db.Column(db.Boolean, default=False)
    include_example_email = db.Column(db.Boolean, default=False)
    reset_password_code = db.Column(db.String(255), default=None)
    verify_account_code = db.Column(db.String(255), default=None)
    reset_password_status = db.Column(db.String(255), default=None)
    gifs = relationship("UserGif", backref="user")
    logos = relationship("UserLogo", backref="user")
    tags = relationship("Tag", back_populates="user")


class UserGif(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    gif_name = db.Column(db.String)
    duration = db.Column(db.Integer)
    gif_url = db.Column(db.String)
    source = db.Column(db.String(255))
    resourceId = db.Column(db.String, unique=True)
    selectedColor = db.Column(db.String)
    selectedFrame = db.Column(db.String)
    frame_urls = db.Column(ARRAY(String), nullable=True)
    click_count = db.Column(db.Integer, default=0)
    resourcetype = db.Column(db.String(255))
    base64_string = db.Column(db.Text)
    user = db.relationship('User', back_populates='gifs')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ai_description = db.Column(db.String(1000))
    example_email = db.Column(db.Text)
    tags = db.relationship('Tag', secondary=tag_association, back_populates='gifs')


class UserLogo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    resource_id = db.Column(db.String, unique=True)
    user = db.relationship('User', back_populates='logos')

class GifCounter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    count = db.Column(db.Integer, default=200)

    @classmethod
    def increment_count(cls):
        counter = cls.query.first()
        if not counter:
            counter = cls(count=1)
            db.session.add(counter)
        else:
            counter.count += 1
        db.session.commit()


User.tags = db.relationship('Tag', back_populates='user')
User.gifs = db.relationship('UserGif', back_populates='user')
User.logos = db.relationship('UserLogo', back_populates='user')
