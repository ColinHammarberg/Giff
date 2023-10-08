import React, { useEffect, useState } from 'react';
import './Landing.scss';
import { useNavigate } from 'react-router-dom';
import GiftIntroduction from '../resources/Gift-introduction.gif';

function Landing() {
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
//   const isShowCountDown = localStorage.getItem('count-down')
  const access_token = localStorage.getItem('access_token');

  useEffect(() => {
    // Start the 12-second delay
    const initialDelay = setTimeout(() => {
      // Initialize the countdown at 3
      setCountdown(3);
    }, 6700);

    return () => clearTimeout(initialDelay); // Cleanup timeout if component is unmounted
  }, []);

  useEffect(() => {
    let countdownTimer;
    if (countdown > 0) {
      // If countdown is between 1 and 3, set a timer to decrement it each second
      countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      localStorage.setItem('show-count-down', false); // Storing to localStorage
      navigate(access_token ? '/choose-option-create' : 'single-gif-creation')
    }

    return () => clearTimeout(countdownTimer); // Cleanup timeout if component is unmounted
  }, [countdown, navigate, access_token]);

  return (
    <>
      <div className="landing">
        {countdown === null ? (
          <img src={GiftIntroduction} alt="" />
        ) : (
          <div 
            className="countdown"
            style={{ color: countdown === 3 ? '#F4149B' : countdown === 2 ? '#B9F140' : '#FE6B01' }}
          >
            {countdown}
          </div>
        )}
      </div>
    </>
  );
}

export default Landing;
