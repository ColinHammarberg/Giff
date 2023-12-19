from PIL import Image, ImageSequence
import io

def resize_gif(input_bytes, resolution):
    # Convert resolution string to (width, height)
    width, height = map(int, resolution.split('x'))

    # Open and resize the GIF
    img = Image.open(input_bytes)
    frames = [frame.copy().resize((width, height), Image.LANCZOS) for frame in ImageSequence.Iterator(img)]

    # Save the resized GIF
    output_bytes = io.BytesIO()
    frames[0].save(output_bytes, format="GIF", save_all=True, append_images=frames[1:], loop=0)
    output_bytes.seek(0)
    return output_bytes


def resize_gif_add_on(input_bytes, new_height):
    # Open the original GIF
    img = Image.open(input_bytes)
    original_width, original_height = img.size

    aspect_ratio = original_width / original_height
    new_width = int(new_height * aspect_ratio)

    # Resize the GIF frames
    frames = [frame.copy().resize((new_width, new_height), Image.LANCZOS) for frame in ImageSequence.Iterator(img)]

    # Save the resized GIF
    output_bytes = io.BytesIO()
    frames[0].save(output_bytes, format="GIF", save_all=True, append_images=frames[1:], loop=0)
    output_bytes.seek(0)
    return output_bytes