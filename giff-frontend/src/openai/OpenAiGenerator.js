import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import './OpenAiGenerator.scss';
import Header from '../component/Header';
import UserAvatar from './UserAvatar';

const OpenAiGenerator = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [showUserMessage, setShowUserMessage] = useState(false);

  const messages = [
    "Hey, champ. Tell me a little bit about the email you want to send. Who’s it for?",
    "What industry are they in? If you could dream, what would your gif achieve? Etc.",
  ];

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleGenerateClick = () => {
    setShowUserMessage(true);
    axios
      .post('http://127.0.0.1:5000/chat', { message })
      .then((res) => {
        const generatedResponse = res.data.response;
        setResponse(generatedResponse);
      })
      .catch((error) => {
        console.error('Error:', error);
        setResponse('An error occurred.');
      });
  };

  useEffect(() => {
    if (messageIndex < messages.length) {
      const timeoutId = setTimeout(() => {
        setMessageIndex(messageIndex + 1);
      }, 3000); // Adjust the delay (in milliseconds) as needed
      return () => clearTimeout(timeoutId);
    }
  }, [messageIndex, messages.length]);

  return (
    <div className="open-ai-generator">
      <Header />
      <div className="title">Talk to mrs. Gif-t, your friendly neighborhood AI</div>
      <div className="chat-bot">
        <div className="fields">
            {messages.slice(0, messageIndex).map((message, index) => (
            <div className="field" key={index}>
                <div className="text">
                    <UserAvatar openAi />
                    <TextField variant="outlined" value={message} disabled />
                </div>
            </div>
            ))}
            {showUserMessage && (
                <div className="field">
                    <div className="text">
                        <UserAvatar user />
                        <TextField variant="outlined" value={message} disabled />
                    </div>
                </div>
            )}
            {response && (
            <div className="field generated-answer">
                <div className="text">
                <UserAvatar instance="Mrs. Gif-t (AKA The AI)" />
                <div className="response">{response || 'tell me'}</div>
                </div>
            </div>
            )}
        </div>
        {messageIndex >= messages.length && (
            <div className="message-input" style={{ flex: '0 0 auto' }}>
                <TextField
                    variant="outlined"
                    value={message}
                    onChange={handleMessageChange}
                />
            </div>
        )}
      </div>
      <div className="action">
        {messageIndex >= messages.length && (
          <Button variant="contained" onClick={handleGenerateClick} className="next-step-btn">
            Go to next step
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpenAiGenerator;
