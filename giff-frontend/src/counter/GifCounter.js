import React from 'react';
import './GifCounter.scss';
import { useFetchGifCount } from './useFetchGifCount';
function GifCounter() {
  const { gifCount } = useFetchGifCount();

  return (
    <div className="gif-counter">
      <div className="text">
        Currently <span>{gifCount}</span> gifs have <br></br>been crafted using
        Gif-t{' '}
      </div>
    </div>
  );
}

export default GifCounter;
