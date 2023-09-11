import React, { useState } from 'react';
import { Button, InputLabel, TextField } from '@mui/material';
import axios from 'axios';
import './OpenAiGenerator.scss';
import Header from '../component/Header';
import UserAvatar from './UserAvatar';

const OpenAiGenerator = () => {
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleGenerateClick = () => {
    // Make an API request to your Flask backend
    axios
      .post('http://127.0.0.1:5000/chat', { description })
      .then((res) => {
        const generatedResponse = res.data.response;
        setResponse(generatedResponse);
      })
      .catch((error) => {
        console.error('Error:', error);
        setResponse('An error occurred.');
      });
  };

  return (
    <div className="open-ai-generator">
        <Header />
        <div className="title">Talk to mrs. Gif-t, your friendly neighborhood AI</div>
        <div className="fields">
            <div className="field first">
                <InputLabel shrink htmlFor="text-input">
                    Name
                </InputLabel>
                <div className="text">
                    <UserAvatar instance=" Mrs. Gif-t (AKA The AI)" />
                    <TextField
                        variant="outlined"
                        value="Hey, champ. Tell me a little bit about the email you want to send. Who’s it for?"
                        // value={description}
                        // onChange={handleDescriptionChange}
                    />
                </div>
            </div>
            <div className="field second">
                <InputLabel shrink htmlFor="text-input">
                    Name
                </InputLabel>
                <div className="text">
                    <UserAvatar instance=" Mrs. Gif-t (AKA The AI)" />
                    <TextField
                        variant="outlined"
                        value="What industry are they in? If you could dream, what would your gif achieve? Etc."
                        // onChange={handleDescriptionChange}
                    />
                </div>
            </div>
        <div className="field third">
            <InputLabel shrink htmlFor="text-input">
                Name
            </InputLabel>
            <div className="text">
                <UserAvatar instance="You (Aka champ)" />
                <TextField
                    variant="outlined"
                    value={description}
                    onChange={handleDescriptionChange}
                />
            </div>
        </div>
        <div className="generated-answer">
            <strong>Response:</strong>
            <p style={{ color: '#fff'}}>{response}</p>
        </div>
    </div>
         <div className="action">
            <Button variant="contained" onClick={handleGenerateClick} className="next-step-btn">
                Go to next step
            </Button>
        </div>
    </div>
  );
};

export default OpenAiGenerator;
