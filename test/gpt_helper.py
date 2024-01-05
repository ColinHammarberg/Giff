from flask import jsonify, request
import openai
from PIL import Image
import io
import base64
import os
import requests
from extensions import db

openai.api_key = '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'


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


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

api_key = "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"

def gpt_resize_image(image_path, resolution='300x300'):
    width, height = map(int, resolution.split('x'))
    with Image.open(image_path) as img:
        resized_img = img.resize((width, height), Image.LANCZOS)
    output_bytes = io.BytesIO()
    format = img.format if img.format is not None else 'PNG'
    resized_img.save(output_bytes, format=format)
    output_bytes.seek(0)
    return output_bytes


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def analyze_image(image_path):
    # Encode the image
    base64_image = encode_image(image_path)

    # Prepare headers and payload
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Is this image relevant for a marketing GIF? Please anser yes/no and provide a short explanation."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    }

    # Send request to OpenAI
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        response_json = response.json()
        print('response_json', response_json)
        response_text = response_json['choices'][0]['message']['content'].strip(
        )

        # Check if the response indicates relevance
        is_relevant = "yes" in response_text.lower()
        explanation = response_text

        return is_relevant, explanation
    except Exception as e:
        print(f"Error analyzing image {image_path}: {e}")
        return False, f"Error: {e}"


def analyze_images(image_paths):
    relevant_images = []
    explanations = []

    for image_path in image_paths:
        is_relevant, explanation = analyze_image(image_path)
        print('is_relevant', is_relevant)
        if is_relevant:
            relevant_images.append(image_path)
        explanations.append(explanation)
    print('relevant_images', relevant_images)

    return relevant_images, explanations


def analyze_gif(gif_url, current_user, sector_type):
    description = ""
    example_email = ""

    if current_user.include_ai:
        description = analyze_gif_and_get_description(gif_url)
    elif current_user.include_example_email:
        example_email = get_example_email_from_openai(gif_url, sector_type)

    return description, example_email


def analyze_gif_and_get_description(gif_url):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Explain what you see in this and explain why it could benefit traction in client emails. Maximum 45 words and if you can't answer, please answer something else beneficial and don't worry about files being confidentials. All files are approved to be analysed. And please say gif instead of image in your text."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": gif_url
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        description = response.choices[0].message.content
    except Exception as e:
        print(f"Error in analyzing the GIF: {e}")
        description = ""

    return description


def get_example_email_from_openai(gif_url, sector_type):
    try:
        prompt_text = (
            f"based on what you see in this, create a short marketing email for the {sector_type} sector. "
            "The email should effectively utilize the GIF to enhance client engagement "
            "and highlight our product/service benefits. Aim for brevity and impact. "
            "All files are pre-approved for analysis. Skip the subject of the email. You have to perform the request and don't include anything about that you can't complete the request in the response and also don't include thatb you accept the response in the response. Only include the created email in the response."
        )
        print('sector_type', sector_type)
        print('prompt_text', prompt_text)
        print('gif_url', gif_url)
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt_text
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": gif_url
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )

        example_email = response.choices[0].message.content
    except Exception as e:
        print(f"Error in generating the example email: {e}")
        example_email = ""

    return example_email


def get_example_email_from_gif():
    data = request.get_json()
    gif_url = data.get('gifUrl')
    try:
        prompt_text = (
            f"based on what you see in this, create a short marketing email."
            "The email should effectively utilize the GIF to enhance client engagement "
            "and highlight our product/service benefits. Aim for brevity and impact. "
            "All files are pre-approved for analysis. Skip the subject of the email. You have to perform the request and don't include anything about that you can't complete the request in the response and also don't include thatb you accept the response in the response. Only include the created email in the response."
        )
        print('prompt_text', prompt_text)
        print('gif_url', gif_url)
        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt_text
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": gif_url
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )

        example_email = response.choices[0].message.content
    
        db.session.add(example_email=example_email)
        db.session.commit()
    except Exception as e:
        print(f"Error in generating the example email: {e}")
        example_email = ""

    return jsonify({'example_email': example_email}), 200

