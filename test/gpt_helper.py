from flask import jsonify, request
import openai
from PIL import Image
import io
import base64
import os

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
    
def analyze_folder_with_gpt(folder_path):
    image_paths = [os.path.join(folder_path, img) for img in os.listdir(folder_path) if img.endswith('.png')]
    relevant_paths = []

    for img_path in image_paths:
        with Image.open(img_path) as img:
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Define a prompt to ask GPT-4 if the image is relevant for inclusion in a GIF
            prompt = {
                'image': img_base64,
                'query': "Is this image relevant for inclusion in a GIF?"
            }
            
            # Query GPT-4 with the prompt
            response = openai.Answer.create(
                model="text-davinci-002",
                question=prompt,
                examples_context="In this task, you need to determine if the given image is relevant for inclusion in a GIF to showcase the company.",
                examples=[({"image": "base64_encoded_image_1", "query": "Is this image relevant for inclusion in a GIF?"}, "yes"),
                          ({"image": "base64_encoded_image_2", "query": "Is this image relevant for inclusion in a GIF?"}, "no")],
                max_tokens=10,
                stop=None,
                temperature=0
            )
            
            is_relevant = response['choices'][0]['answer'].strip().lower()
            
            if is_relevant == 'yes':
                relevant_paths.append(img_path)

    return relevant_paths