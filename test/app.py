from flask import Flask, render_template, jsonify, request, send_file
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import imageio
import time
import os
from flask_cors import CORS
from PIL import Image
import fitz  # Import the PyMuPDF library
import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment
import base64
import openai
from decouple import config

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

@app.route('/')
def index():
    return render_template('index.html')

# Send email

openai.api_key = os.environ.get('OPENAI_API_KEY')
openai.api_key = config('OPENAI_API_KEY')

# Flask route for handling GPT-3 requests

@app.route('/chat', methods=['POST'])
# Flask route for handling GPT-3 requests

@app.route('/chat', methods=['POST'])
def chat_with_gpt():
    data = request.get_json()
    print('user_query', data)
    if 'description' not in data:
        return jsonify({'error': 'User query not provided'}), 400

    user_query = data['description']

    try:
        # Construct a prompt that includes the user's query
        prompt = f"User asks: '{user_query}'\nChatGPT responds:"
        # Make a request to GPT-3 with the constructed prompt
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            max_tokens=500, # Adjust the max_tokens as needed
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
        return jsonify({'error': 'Invalid JSON data'}), 400  # Return a Bad Request response
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
        attachment.file_content = base64.b64encode(attachment_file).decode('utf-8')
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
            return jsonify({'error': error_message}), 500  # 500 is the HTTP status code for Internal Server Error
        else:
            # Return a generic error response if there is no error message
            return jsonify({'error': 'An error occurred'}), 500

# Endpoint for generating gif out of webpages

@app.route('/generate-gif', methods=['POST'])

def generate_gif():
    data = request.get_json()
    URL = data.get('url')

    # Create ChromeOptions for headless mode
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Add this line for headless mode

    # Create a new Chrome session in headless mode
    driver = webdriver.Chrome(options=chrome_options)
    driver.get(URL)

    # Get the scroll height
    scroll_height = driver.execute_script("return document.body.scrollHeight")

    print('scroll_height', scroll_height)

    if scroll_height < 1000:
        return jsonify({ 'error': 'Invalid scroll height' })
    
    elif 1000 <= scroll_height < 3000:
        timer = 200
        # duration = 0.10
    
    elif 3000 <= scroll_height < 5000:
        timer = 300
        # duration = 0.08
    
    elif 5000 <= scroll_height < 9000:
        timer = 400
        # duration = 0.07
    
    else:
        timer = 500
        # duration = 0.08

    # Create a directory to store individual screenshots
    screenshots_dir = 'screenshots'
    os.makedirs(screenshots_dir, exist_ok=True)

    # Take screenshots while scrolling
    for i in range(0, scroll_height, timer):
        driver.execute_script(f"window.scrollTo(0, {i})")
        time.sleep(1)  # Allow time for the page to render
        screenshot_path = os.path.join(screenshots_dir, f'screenshot_{i}.png')
        driver.save_screenshot(screenshot_path)

    # Close the driver
    driver.quit()

    # Create a GIF from the screenshots
    # frontend folder
    gifs_frontend_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    # backend folder
    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test', 'gifs')
    os.makedirs(gifs_frontend_folder, exist_ok=True)
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_frontend_folder, 'scrolling_animation.gif')
    output_backend_path = os.path.join(gifs_folder, 'scrolling_animation.gif')
    screenshots = sorted(os.listdir(screenshots_dir))
    frames = [imageio.imread(os.path.join(screenshots_dir, screenshot)) for screenshot in screenshots]
    imageio.mimsave(output_path, frames, duration=0.08, loop=0) # Set duration and loop
    imageio.mimsave(output_backend_path, frames, duration=0.08, loop=0) # Set duration and loop
    print(f"GIF saved at {output_path}")

    # Clean up: Delete individual screenshots
    for screenshot in screenshots:
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    return jsonify({'message': 'GIF generated successfully'})

# Endpoint for generating gif out of online pdfs

@app.route('/generate-pdf-gif', methods=['POST'])
def generate_pdf_gif():
    data = request.get_json()
    URL = data.get('url')
    
    # Create a temporary directory to store individual images
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pdf_images')
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
    output_path = os.path.join(gifs_folder, 'pdf_animation.gif')

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


@app.route('/download-gif', methods=['GET'])

def download_gif():
    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gif_filename = 'scrolling_animation.gif'
    gif_path = os.path.join(gifs_folder, gif_filename)
    return send_file(gif_path, as_attachment=True, attachment_filename=gif_filename)

if __name__ == '__main__':
    app.run(debug=True)
