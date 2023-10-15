import React from 'react';
import SingleGif from '../resources/Singlegif.gif';
import MultipleGif from '../resources/Multiplegif.gif';

function LoadingGif({ singleGif }) {
    return (
        <img src={singleGif ? SingleGif : MultipleGif} alt="" />
    )
}

export default LoadingGif;