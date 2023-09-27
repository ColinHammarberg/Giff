from flask import Flask, render_template, jsonify, request, send_file, send_from_directory
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import imageio
import time
import os
import io
from flask_cors import CORS
from PIL import Image
import fitz  # Import the PyMuPDF library
import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment
import base64
import openai
import zipfile
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app


@app.route('/')
def index():
    return render_template('index.html')

# Send email


openai.api_key = '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'
backend_gifs_folder = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'gifs')

# Flask route for handling GPT-3 requests
@app.route('/chat', methods=['POST'])
def chat_with_gpt():
    data = request.get_json()
    print('user_query', data)

    if 'message' not in data:
        return jsonify({'error': 'User query not provided'}), 400

    message = data['message']

    try:
        # Construct a prompt that includes the user's query and additional instructions/rules
        prompt = f"User asks: '{message}'\nChatGPT responds: Generate an email with the following rules and information:\n"
        prompt += "- Start the email with a friendly greeting.\n"
        prompt += "- Include the recipient's name and mention the purpose of the email.\n"
        prompt += "- Ask a follow-up question to engage the recipient.\n"
        prompt += "- End the email politely.\n"
        prompt += "Email content:"

        # Make a request to GPT-3 with the constructed prompt
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            max_tokens=500,  # Adjust the max_tokens as needed
            n=1,
            stop=None,
            temperature=0.7
        )

        # Extract the generated text from the response
        generated_text = response.choices[0].text.strip()

        return jsonify({'response': generated_text}), 200

    except Exception as e:
        # Log the error message for debugging
        print('Error:', str(e))
        return jsonify({'error': 'An error occurred while generating a response'}), 500


@app.route('/send_gif', methods=['POST'])
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
        print('sendgrid_api_key', sendgrid_api_key)
        sg = SendGridAPIClient(sendgrid_api_key)
        print('attached', attachment_file)

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

        # email_html_content = f'''
        # <!DOCTYPE html>
        # <html>
        # <body>
        #     <p>Click the GIF below to open the link in a new tab:</p>
        #     <a href="{attachment}" target="_blank">
        #         <img src="{attachment}" alt="Clickable GIF" width="300" height="200">
        #     </a>
        # </body>
        # </html>
        # '''

        # # Set the HTML content
        # message.html_content = email_html_content

        # Specify template id
        message.template_id = dynamic_template_id

        message.from_email = 'colin.hammarberg2@gmail.com'

        message.subject = global_substitutions

        print('message', message)

        # Send the email
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)

        # Email sent successfully, return a success response
        return jsonify({'message': 'Email sent successfully'}), 200
    except Exception as e:
        if hasattr(e, 'body') and e.body:
            error_message = e.body.decode()
            print(error_message)
            # Return an error response with the error message
            # 500 is the HTTP status code for Internal Server Error
            return jsonify({'error': error_message}), 500
        else:
            # Return a generic error response if there is no error message
            return jsonify({'error': 'An error occurred'}), 500

# Endpoint for generating gif out of webpages


def is_video_url(URL):
    # Check if the URL includes "youtube" or "vimeo"
    return "youtube" in URL or "vimeo" in URL


@app.route('/generate-single-gif', methods=['POST'])
def generate_gif():
    data = request.get_json()
    URL = data.get('url')
    # default name if name isn't passed as a value
    NAME = data.get('name', 'scrolling_animation.gif')

    # Check if the URL is a YouTube or Vimeo link
    if is_video_url(URL):
        return jsonify({'error': 'video url'})

    # Create ChromeOptions for headless mode
    chrome_options = Options()
    # Add this line for headless mode
    chrome_options.add_argument('--headless')

    # Create a new Chrome session in headless mode
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(URL)

    # Get the scroll height
    scroll_height = driver.execute_script("return document.body.scrollHeight")

    print('scroll_height', scroll_height)

    if scroll_height < 1000:
        return jsonify({'error': 'Invalid scroll height'})

    elif 1000 <= scroll_height < 3000:
        timer = 200
        duration = timer / 600.0 #0.333s / per screenshot

    elif 3000 <= scroll_height < 5000:
        timer = 300
        duration = timer / 800.0 #0.375s / per screenshot

    elif 5000 <= scroll_height < 9000:
        timer = 400
        duration = timer / 1500.0 #0.266s / per screenshot

    else:
        timer = 500
        duration = timer / 2000.0 #0.25s / per screenshot

    print('duration', duration)

    if not NAME.endswith('.gif'):
        NAME += '.gif'

    # Create a directory to store individual screenshots
    screenshots_dir = 'screenshots'
    os.makedirs(screenshots_dir, exist_ok=True)

    driver.execute_script("document.body.style.overflow = 'hidden'")

    # Take screenshots while scrolling
    for i in range(0, scroll_height, timer):
        driver.execute_script(f"window.scrollTo(0, {i})")
        time.sleep(1)  # Allow time for the page to render
        screenshot_path = os.path.join(screenshots_dir, f'screenshot_{i}.png')
        driver.save_screenshot(screenshot_path)

    # Close the driver
    driver.quit()

    # Create a list to store frames with adjusted durations
    frames_with_durations = []

    # Load each frame and set the duration
    for screenshot in os.listdir(screenshots_dir):
        screenshot_path = os.path.join(screenshots_dir, screenshot)
        frame = Image.open(screenshot_path)
        frames_with_durations.append((frame, duration))

    # Create GIF output paths
    gifs_frontend_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'test', 'gifs')
    os.makedirs(gifs_frontend_folder, exist_ok=True)
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_frontend_folder, NAME)
    output_backend_path = os.path.join(gifs_folder, NAME)

    # Create a GIF from the frames with adjusted durations
    frames_with_durations[0][0].save(
        output_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )
    frames_with_durations[0][0].save(
        output_backend_path,
        save_all=True,
        append_images=[frame for frame, _ in frames_with_durations[1:]],
        duration=[int(d * 1000) for _, d in frames_with_durations],
        loop=0
    )

    # Clean up: Delete individual screenshots
    for screenshot in os.listdir(screenshots_dir):
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    return jsonify({'message': 'GIF generated successfully'})


# Endpoint for generating gif out of online pdfs

@app.route('/generate-gifs-from-list', methods=['POST'])
def generate_gifs_from_list():
    data = request.get_json()
    # Use get method with a default value to handle missing 'gifData'
    gifData = data.get('gifData', [])

    if not gifData:
        return jsonify({'error': 'No GIF data provided'})

    error_messages = set()  # Use a set to store unique error messages

    for gif in gifData:
        URL = gif.get('url')
        name = gif.get('name')

        if not URL:
            error_messages.add("Missing URL")
        else:
            # Check if the URL is a YouTube or Vimeo link
            if is_video_url(URL):
                error_messages.add("video")
            else:
                response = requests.post(
                    'http://localhost:5000/generate-single-gif', json={'url': URL, 'name': name})
                if response.status_code != 200:
                    error_messages.add(
                        f"Failed to generate GIF for URL: {URL}")

                # Check the scroll_height error for each URL
                single_gif_data = response.json()
                if 'error' in single_gif_data and single_gif_data['error'] == 'Invalid scroll height':
                    error_messages.add("Invalid scroll height")

    if error_messages:
        return jsonify({'error': '\n'.join(error_messages)})

    return jsonify({'message': 'GIFs generated successfully for all URLs'})


@app.route('/generate-pdf-gif', methods=['POST'])
def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    NAME = data.get('name', 'pdf_animation.gif') # default name if name isn't passed as a value
    
    # Create a temporary directory to store individual images
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pdf_images')
    if not NAME.endswith('.gif'):
        NAME += '.gif'
    os.makedirs(images_dir, exist_ok=True)

    # Download the PDF content
    pdf_response = requests.get(URL)
    pdf_path = os.path.join(images_dir, 'temp.pdf')

    with open(pdf_path, 'wb') as pdf_file:
        pdf_file.write(pdf_response.content)

    # Use PyMuPDF to extract images from PDF pages
    pdf_document = fitz.open(pdf_path)

    print('pdf_document.page_count', pdf_document.page_count)
    
    for page_number in range(pdf_document.page_count):
        page = pdf_document[page_number]
        image_list = page.get_pixmap()
        img = Image.frombytes("RGB", [image_list.width, image_list.height], image_list.samples)
        img_path = os.path.join(images_dir, f'page_{page_number + 1}.png')
        img.save(img_path, 'PNG')

    pdf_document.close()

    # Create a GIF from the images
    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, NAME)

    image_paths = sorted(os.listdir(images_dir))
    frames = [Image.open(os.path.join(images_dir, img_path)) for img_path in image_paths if img_path.endswith('.png')]
    frame_durations = [0.5] * len(frames)
    print('frame_durations', frame_durations)
    imageio.mimsave(output_path, frames, duration=frame_durations, loop=0)  # Adjust duration as needed

    # Clean up: Delete individual images and temporary PDF
    for img_path in image_paths:
        os.remove(os.path.join(images_dir, img_path))
    os.rmdir(images_dir)

    print(f"PDF GIF saved at {output_path}")
    
    return jsonify({'message': 'GIF generated successfully'})


@app.route('/generate-pdf-gifs-from-list', methods=['POST'])
def generate_pdf_gifs_from_list():
    data = request.get_json()
    gifData = data['gifData']
    print('data', gifData)

    # Check if 'gifData' key exists in the JSON data
    if 'gifData' not in data:
        return jsonify({'error': 'No GIF data provided'})

    for gif in gifData:
        URL = gif['url']
        name = gif['name']

        response = requests.post(
            'http://localhost:5000/generate-pdf-gif', json={'url': URL, 'name': name})

        if response.status_code != 200:
            return jsonify({'error': f'Failed to generate GIF for URL: {URL}'})

    return jsonify({'message': 'GIFs generated successfully for all URLs'})


@app.route('/download-gif', methods=['GET'])
def download_gif():
    gifs_folder = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gif_filename = 'scrolling_animation.gif'
    gif_path = os.path.join(gifs_folder, gif_filename)
    return send_file(gif_path, as_attachment=True, attachment_filename=gif_filename)

@app.route('/download-all-gifs', methods=['GET'])
def download_all_gifs():
    gifs_folder = backend_gifs_folder
    print('backend_gifs_folder', backend_gifs_folder)

    try:
        # Create an in-memory file for the ZIP archive
        zip_buffer = io.BytesIO()

        # Create a zip archive containing all files in the gifs_folder using ZIP_STORED compression method
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zipf:
            for root, _, files in os.walk(gifs_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, gifs_folder)
                    zipf.write(file_path, arcname=arcname)

        # Set the position to the beginning of the in-memory file
        zip_buffer.seek(0)

        # Send the in-memory ZIP file as a response
        return send_file(
            zip_buffer,
            as_attachment=True,
            download_name='all_gifs.zip',
            mimetype='application/zip'
        )
    except Exception as e:
        # Log the error message (you can replace this with proper logging)
        print(f"Error creating ZIP file: {str(e)}")
        # Optionally, you can return an error response to the client
        return "An error occurred while creating the ZIP file", 500


@app.route('/gifs/<path:filename>')
def serve_gif(filename):
    return send_from_directory(backend_gifs_folder, filename)


@app.route('/api/get-gifs')
def get_gifs():
    gif_list = []

    for filename in os.listdir(backend_gifs_folder):
        if filename.endswith('.gif'):
            gif_list.append({'filename': filename})

    return jsonify({'gifs': gif_list})


if __name__ == '__main__':
    app.run(debug=True)
