from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify, request
from models import Tag, UserGif


@jwt_required()
def assign_tag_relationship_gif():
    data = request.get_json()
    user_id = get_jwt_identity()
    resource_id = data.get('resourceId')
    tag_value = data.get('value')

    tag = Tag.query.filter_by(user_id=user_id, tag_value=tag_value).first()
    user_gif = UserGif.query.filter_by(
        user_id=user_id, resourceId=resource_id).first()

    if not tag or not user_gif:
        return jsonify({'error': 'Tag or GIF not found'}), 404

    # Assign the tag to the GIF
    if tag not in user_gif.tags:
        user_gif.tags.append(tag)
        db.session.commit()

    updated_tags = [{'id': t.id, 'value': t.tag_value,
                     'color': t.color} for t in user_gif.tags]
    print('updated_tags', updated_tags)
    return jsonify({'message': 'Tag assigned to GIF successfully', 'tags': updated_tags}), 200


@jwt_required()
def add_user_tag():
    data = request.get_json()
    user_id = get_jwt_identity()
    tag_value = data.get('tagValue')
    color = data.get('color')

    existing_tag = Tag.query.filter_by(
        user_id=user_id, tag_value=tag_value).first()
    if existing_tag:
        return jsonify({'message': 'Tag already exists'}), 409

    new_tag = Tag(user_id=user_id, tag_value=tag_value, color=color)
    db.session.add(new_tag)
    db.session.commit()

    new_tag_data = {
        'id': new_tag.id,
        'value': new_tag.tag_value,
        'color': new_tag.color,
        'user_id': new_tag.user_id
    }

    return jsonify({'message': 'New tag added successfully', 'tag': new_tag_data}), 201


@jwt_required()
def delete_user_tag():
    user_id = get_jwt_identity()
    data = request.get_json()
    tag_value = data.get('value')

    # Query the tag to be deleted
    tag = Tag.query.filter_by(tag_value=tag_value, user_id=user_id).first()
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    user_gifs = UserGif.query.filter(UserGif.tags.any(tag_value=tag_value)).all()
    for user_gif in user_gifs:
        if tag in user_gif.tags:
            user_gif.tags.remove(tag)

    db.session.delete(tag)
    db.session.commit()

    # Fetch updated tags
    updated_user_tags = Tag.query.filter_by(user_id=user_id).all()
    updated_tags = [{'id': tag.id, 'value': tag.tag_value, 'color': tag.color} for tag in updated_user_tags]

    return jsonify({'message': 'Tag deleted successfully', 'tags': updated_tags}), 200



@jwt_required()
def fetch_user_tags():
    user_id = get_jwt_identity()

    # Query all tags associated with the user
    user_tags = Tag.query.filter_by(user_id=user_id).all()

    formatted_tags = [{'id': tag.id, 'value': tag.tag_value,
                       'color': tag.color} for tag in user_tags]

    return jsonify({'message': 'Success', 'tags': formatted_tags}), 200
