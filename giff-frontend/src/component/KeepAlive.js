import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeepAccessAlive } from '../endpoints/Apis';

const KeepAliveComponent = () => {
  const navigate = useNavigate();

  const sendKeepAlive = useCallback(async () => {
    try {
      const response = await KeepAccessAlive();
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
    } catch (error) {
      navigate('/');
      console.error('Error during keep-alive:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const keepAliveInterval = setInterval(sendKeepAlive, 1 * 60 * 1000);

    return () => clearInterval(keepAliveInterval);
  }, [sendKeepAlive]);

  return null;
};

export default KeepAliveComponent;
