import React, { useState } from 'react';
import { TextField } from '@mui/material';
import axios from 'axios';
import Gif from './gifs/scrolling_animation.gif'
import './App.css'

function App() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [url, setUrl] = useState('');

  const generateGif = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-gif', {url});
      console.log('response', response);
      if (response.data.message === 'GIF generated successfully') {
        setGifGenerated(true);
      }
    } catch (error) {
      console.error('Error generating GIF:', error);
    }
  };

  function handleOnChangeUrl(event) {
    setUrl(event?.target?.value)
  }

  console.log('url', url);

  return (
    <div className="App">
      <h1>Interactive GIF Generator</h1>
      <TextField onChange={(event) => handleOnChangeUrl(event)} />
      <button onClick={generateGif}>Generate GIF</button>
      <div className="gifs">
        {gifGenerated && <img src={Gif} alt="Generated GIF" />}
      </div>
    </div>
  );
}

export default App;
