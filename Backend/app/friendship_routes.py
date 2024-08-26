from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from .models import User, Friendship, Message
from .Lemon import db

friendship_bp = Blueprint('friendship', __name__)

@friendship_bp.route('/send-friend-request', methods=['POST'])
@login_required
def send_friend_request():
    friend_id = request.json.get('friend_id')
    if not friend_id:
        return jsonify({'error': 'Friend ID is required'}), 400
    
    friendship = Friendship(user_id=current_user.id, friend_id=friend_id)
    db.session.add(friendship)
    db.session.commit()
    return jsonify({'message': 'Friend request sent'}), 200

@friendship_bp.route('/accept-friend-request/<int:request_id>', methods=['POST'])
@login_required
def accept_friend_request(request_id):
    friendship = Friendship.query.get_or_404(request_id)
    if friendship.friend_id != current_user.id:
        return jsonify({'error': 'Not authorized'}), 403
    
    friendship.status = 'accepted'
    db.session.commit()
    return jsonify({'message': 'Friend request accepted'}), 200

@friendship_bp.route('/send-message', methods=['POST'])
@login_required
def send_message():
    receiver_id = request.json.get('receiver_id')
    content = request.json.get('content')
    
    if not receiver_id or not content:
        return jsonify({'error': 'Receiver ID and content are required'}), 400
    
    message = Message(sender_id=current_user.id, receiver_id=receiver_id, content=content)
    db.session.add(message)
    db.session.commit()
    return jsonify({'message': 'Message sent'}), 200

@friendship_bp.route('/friends-list', methods=['GET'])
@login_required
def friends_list():
    user_id = current_user.id
    # Query friendships where the user is either the requester or the friend, and the status is 'accepted'
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) & (Friendship.status == 'accepted')
    ).all()

    friends = []
    for friendship in friendships:
        # Determine the friend's ID and details
        if friendship.user_id == user_id:
            friend = User.query.get(friendship.friend_id)
        else:
            friend = User.query.get(friendship.user_id)

        # Append the friend's details to the list
        if friend:
            friends.append({
                'id': friend.id,
                'username': friend.username,
                'profile_image': friend.profile_image  # Optionally include the profile image or other details
            })

    return jsonify(friends), 200


@friendship_bp.route('/incoming-friend-requests', methods=['GET'])
@login_required
def incoming_friend_requests():
    user_id = current_user.id
    # Query for all friend requests where the current user is the recipient and the status is 'pending'
    pending_requests = Friendship.query.filter_by(friend_id=user_id, status='pending').all()

    incoming_requests = []
    for request in pending_requests:
        # Get the details of the user who sent the friend request
        sender = User.query.get(request.user_id)
        if sender:
            incoming_requests.append({
                'request_id': request.id,
                'sender_id': sender.id,
                'sender_username': sender.username,
                'sender_profile_image': sender.profile_image  # Optionally include profile image or other details
            })

    return jsonify(incoming_requests), 200


@friendship_bp.route('/get-messages', methods=['GET'])
@login_required
def get_messages():
    friend_id = request.args.get('friend_id', type=int)
    
    if not friend_id:
        return jsonify({'error': 'Friend ID is required'}), 400
    
    # Ensure the friend is actually a friend of the current user
    friendship = Friendship.query.filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id)) &
        (Friendship.status == 'accepted')
    ).first()

    if not friendship:
        return jsonify({'error': 'Friendship not found'}), 404

    # Retrieve the messages between the two users
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == friend_id)) |
        ((Message.sender_id == friend_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()

    # Format the messages to return
    messages_data = [
        {
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'timestamp': message.timestamp
        }
        for message in messages
    ]
    
    return jsonify(messages_data), 200


@friendship_bp.route('/remove-friend/<int:friend_id>', methods=['POST'])
@login_required
def remove_friend(friend_id):
    user_id = current_user.id

    # Find the friendship relationship
    friendship = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
    ).first()

    if not friendship:
        return jsonify({'error': 'Friendship not found'}), 404

    db.session.delete(friendship)
    db.session.commit()

    return jsonify({'message': 'Friend removed'}), 200


@friendship_bp.route('/friendship-status/<int:friend_id>', methods=['GET'])
@login_required
def friendship_status(friend_id):
    # Check if the current user and the friend have an accepted friendship or pending request
    friendship = Friendship.query.filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id))
    ).first()

    if friendship:
        return jsonify({'status': friendship.status}), 200
    return jsonify({'status': None}), 200
