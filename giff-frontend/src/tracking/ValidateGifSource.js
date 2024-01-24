import React from 'react';
import { useLocation } from 'react-router-dom';
import { trackGifClick } from './useValidateGifQuery';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ValidateGifSource() {
  const query = useQuery();
  const gif_id = query.get('gif_id');

  console.log('gif_id', gif_id);

  React.useEffect(() => {
    if (gif_id) {
      console.log('Tracking gif_id:', gif_id);
      trackGifClick(gif_id);
    }
  }, [gif_id]);

  return <div className="gif-validator">Testing</div>;
}

export default ValidateGifSource;
