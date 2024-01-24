import React from 'react';
import { useParams } from 'react-router-dom';
import './ValidateGifSource.scss';
import { useTrackGifClick } from './useValidateGifQuery';

function ValidateGifSource() {
  const { gif_id } = useParams();
  const { mutate: trackClick } = useTrackGifClick();

  React.useEffect(() => {
    if (gif_id) {
      trackClick(gif_id);
    }
  }, [gif_id, trackClick]);

  return (
    <div className="gif-validator">
      Testing
    </div>
  );
}

export default ValidateGifSource;
