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

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

@app.route('/')
def index():
    return render_template('index.html')


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
    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    os.makedirs(gifs_folder, exist_ok=True)
    output_path = os.path.join(gifs_folder, 'scrolling_animation.gif')
    screenshots = sorted(os.listdir(screenshots_dir))
    frames = [imageio.imread(os.path.join(screenshots_dir, screenshot)) for screenshot in screenshots]
    imageio.mimsave(output_path, frames, duration=0.08, loop=0) # Set duration and loop
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
