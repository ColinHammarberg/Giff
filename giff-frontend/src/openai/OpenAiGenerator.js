import React, { useState, useEffect } from 'react';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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
    "Hey, champ. Tell me a little bit about the email you want to send. What can I help you with? Who is the email for? What does your gif show etc.?",
    // "What industry are they in? If you could dream, what would your gif achieve? Etc.",
  ];

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleGenerateClick = async () => {
    setShowUserMessage(message);
    axios
      .post('http://127.0.0.1:5000/chat', { message })
      .then((res) => {
        setMessage('');
        const generatedResponse = res.data.response;
        setTimeout(() => {
          setResponse(generatedResponse);
        }, 6000)
      })
      .catch((error) => {
        console.error('Error:', error);
        setResponse('An error occurred.');
      });
  };

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      handleGenerateClick();
    }
  };

  useEffect(() => {
    if (messageIndex < messages.length) {
      const timeoutId = setTimeout(() => {
        setMessageIndex(messageIndex + 1);
      }, 3000);
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
                        <TextField variant="outlined" value={showUserMessage} disabled />
                    </div>
                </div>
            )}
            {response && (
              <div className="field generated-answer">
                <div className="text">
                  <UserAvatar instance="Mrs. Gif-t (AKA The AI)" openAi />
                  <TextField variant="outlined" value={response} disabled 
                    InputProps={{
                      style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                    }}
                  />
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
              onKeyPress={(event) => {
                handleKeyPressGenerateGif(event);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleGenerateClick}>
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
        </div>
      )}
      </div>
      <div className="action">
        {response && (
          <Button variant="contained" onClick={handleGenerateClick} className="next-step-btn">
            Go to next step
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpenAiGenerator;
