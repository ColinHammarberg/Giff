import React from 'react';
import { useParams } from 'react-router-dom';
import { trackGifClick } from './useValidateGifQuery';

function ValidateGifSource() {
  const { gif_id } = useParams();

  console.log('gif_id', gif_id);

  React.useEffect(() => {
    if (gif_id) {
      console.log('gif_id2', gif_id);
      trackGifClick(gif_id);
    }
  }, [gif_id]);

  return <div className="gif-validator">Testing</div>;
}

export default ValidateGifSource;
