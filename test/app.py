from flask import Flask, render_template, jsonify, request, send_file
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import imageio
import time
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

@app.route('/')
def index():
    return render_template('index.html')

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
    
    elif 3000 <= scroll_height < 5000:
        timer = 300
    
    elif 5000 <= scroll_height < 9000:
        timer = 400
    
    else:
        timer = 500

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
    imageio.mimsave(output_path, frames, duration=0.06, loop=0) # Set duration and loop
    print(f"GIF saved at {output_path}")

    # Clean up: Delete individual screenshots
    for screenshot in screenshots:
        os.remove(os.path.join(screenshots_dir, screenshot))
    os.rmdir(screenshots_dir)

    return jsonify({'message': 'GIF generated successfully'})

@app.route('/download-gif', methods=['GET'])

def download_gif():
    gifs_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'giff-frontend', 'src', 'gifs')
    gif_filename = 'scrolling_animation.gif'
    gif_path = os.path.join(gifs_folder, gif_filename)
    return send_file(gif_path, as_attachment=True, attachment_filename=gif_filename)

if __name__ == '__main__':
    app.run(debug=True)
