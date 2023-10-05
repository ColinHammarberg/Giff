from flask import jsonify, request
import openai

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