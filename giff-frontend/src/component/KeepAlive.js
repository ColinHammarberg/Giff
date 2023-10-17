import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeepAccessAlive } from '../endpoints/Apis';

const KeepAliveComponent = () => {
  const navigate = useNavigate();

  const sendKeepAlive = async () => {
    try {
      const response = await KeepAccessAlive();
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
    } catch (error) {
        navigate('/');
        console.error('Error during keep-alive:', error);
    }
  };

  useEffect(() => {
    const keepAliveInterval = setInterval(sendKeepAlive, 1 * 60 * 1000);

    return () => clearInterval(keepAliveInterval);
  }, [navigate]);

  return null;
};

export default KeepAliveComponent;