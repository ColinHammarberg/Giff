import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackGifClick } from './useValidateGifQuery';
import './ValidateGifSource.scss';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ValidateGifSource() {
  const query = useQuery();
  const gif_id = query.get('gif_id');
  const baseText = 'We are validating the gif';
  const [loadingText, setLoadingText] = useState(baseText);

  console.log('gif_id', gif_id);

  useEffect(() => {
    if (gif_id) {
      console.log('Tracking gif_id:', gif_id);
      setTimeout(() => {
        trackGifClick(gif_id);
      }, 3000);

      const interval = setInterval(() => {
        setLoadingText((prev) => {
          return prev.length - baseText.length < 5 ? prev + '.' : baseText;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [gif_id]);

  return (
    <div className="gif-validator">
      {loadingText}
      <span className="typing-cursor"></span>
    </div>
  );
}

export default ValidateGifSource;
