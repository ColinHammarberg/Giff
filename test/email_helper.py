from flask import request, jsonify
from sendgrid.helpers.mail import Mail, Attachment
from sendgrid import SendGridAPIClient
import base64

def send_email():
    attachment_file = './gifs/scrolling_animation.gif'
    data = request.get_json()
    if not isinstance(data, dict):
        # Return a Bad Request response
        return jsonify({'error': 'Invalid JSON data'}), 400
    emailAddresses = data.get('emailAddresses', [])
    global_substitutions = data.get('global_substitutions', {})
    plain_text_content = data.get('plain_text_content', {})
    message = Mail(
        from_email='colin.hammarberg2@gmail.com',
        to_emails=emailAddresses,
        subject=global_substitutions,
        plain_text_content=plain_text_content
    )

    try:
        dynamic_template_id = 'd-f56806a93be04440b772bd40029cbd82'
        sendgrid_api_key = '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'
        sg = SendGridAPIClient(sendgrid_api_key)

        # Read the file content
        with open(attachment_file, 'rb') as file:
            attachment_file = file.read()

        # Create an attachment
        attachment = Attachment()
        attachment.file_content = base64.b64encode(
            attachment_file).decode('utf-8')
        attachment.file_type = 'application/gif'
        attachment.file_name = 'scrolling_animation.gif'

        # Add the attachment to the message
        message.attachment = attachment

        # Specify template id
        message.template_id = dynamic_template_id

        message.from_email = 'colin.hammarberg2@gmail.com'

        message.subject = global_substitutions

        # Send the email
        response = sg.send(message)

        # Email sent successfully, return a success response
        return jsonify({'message': 'Email sent successfully', 'data': response}), 200
    except Exception as e:
        if hasattr(e, 'body') and e.body:
            error_message = e.body.decode()
            # Return an error response with the error message
            # 500 is the HTTP status code for Internal Server Error
            return jsonify({'error': error_message}), 500
        else:
            # Return a generic error response if there is no error message
            return jsonify({'error': 'An error occurred'}), 500