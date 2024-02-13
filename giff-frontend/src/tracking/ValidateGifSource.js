import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackGifClick } from './useValidateGifQuery';
import './ValidateGifSource.scss';
import LoadingGif from '../resources/logo-gradient-border.png';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ValidateGifSource() {
  const query = useQuery();
  const gif_id = query.get('gif_id');
  const baseText = 'we are now validating your link';
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
    <div className="rectangle-third"></div>
    <div className="rectangle-secondary"></div>
    <div className="rectangle-primary"></div>
    <div className="rectangle-success"></div>
      <div className="wrapper">
        <div className="main-title">
          <span>This content preview was created by gif-t</span>
        </div>
        <div>
          <span className="loading-text">{loadingText}</span>
          <span className="typing-cursor"></span>
        </div>
        <img src={LoadingGif} alt="" />
        <div className="bottom">
          <span>
            Worry less, click more - our link validation has you covered.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ValidateGifSource;
