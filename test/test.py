from selenium import webdriver
import imageio
import time
import os

# URL of the webpage you want to scroll
URL = 'https://spce.com'

# Create a new Chrome session
driver = webdriver.Chrome()
driver.get(URL)

# Get the scroll height
scroll_height = driver.execute_script("return document.body.scrollHeight")

# Create a directory to store individual screenshots
screenshots_dir = 'screenshots'
os.makedirs(screenshots_dir, exist_ok=True)

# Take screenshots while scrolling
for i in range(0, scroll_height, 200):
    driver.execute_script(f"window.scrollTo(0, {i})")
    time.sleep(1)  # Allow time for the page to render
    screenshot_path = os.path.join(screenshots_dir, f'screenshot_{i}.png')
    driver.save_screenshot(screenshot_path)

# Close the driver
driver.quit()

# Create a GIF from the screenshots
output_path = 'scrolling_animation.gif'
screenshots = sorted(os.listdir(screenshots_dir))
frames = [imageio.imread(os.path.join(screenshots_dir, screenshot)) for screenshot in screenshots]
imageio.mimsave(output_path, frames, duration=0.6)

# Clean up: Delete individual screenshots
for screenshot in screenshots:
    os.remove(os.path.join(screenshots_dir, screenshot))
os.rmdir(screenshots_dir)
