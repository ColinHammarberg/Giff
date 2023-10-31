import React from 'react';
import { Box, Button } from '@mui/material';
import './GifError.scss';
import Header from './Header';
import ErrorImage from '../resources/Error.png';
import VideoErrorImage from '../resources/Videoerror.png';

const errorMessages = {
    'video error': {
        image: VideoErrorImage,
        reason: 'Usually, our Gif-machine (aka the Gif-ter) scrolls through a page and creates a gif from it, but in this case, it looks like you want to create a gif from a YouTube or Vimeo video. No worries, you can do that too - just click “Create gif from video” to create a gif from the video you added. You can also go back and pick another URL to create a gif from.',
        description: 'Choose whether to create a gif from video or choose another link'
    },
    'height error': {
        image: ErrorImage,
        reason: 'The URL you used leads somewhere that only has one page and  cannot be scrolled, or to a page that requires a login.  Our gif-machine (AKA The Gif-ter) needs an open page that is scrollable to work its magic. Otherwise, it could only give you an image, and we’re fairly sure you’re not here for that.',
        description: 'Please use a Url that can be scrolled'
    },
    'general error': {
        image: ErrorImage,
        reason: 'Our gif-maker (aka the gif-ter) couldn’t work its magic. You may be using a browser that is not supported or that has some serious privacy settings that stop the gif-ter in its tracks. You might also have used a URL that the gif-ter could not access.',
        description: 'Please try another browser or another url'
    },
};

function GifError(props) {    
    function handleOnClickAnotherUrl() {
        props.setError(null);
        props.setGifGenerated(null);
    }

    const errorVariant = errorMessages[props.variant];

    return (
        <div className="gif-error">
            <Header />
            <Box className="error-container">
                <Box>
                    <img src={errorVariant.image} alt="" className="error-img" />
                </Box>
                <Box className={`error-description-box ${props.variant === 'video error' && 'video-error'}`}>
                    <div className="error-description">
                        {errorVariant.reason}
                    </div>
                    <div className="orange-divider">
                        {errorVariant.description}
                    </div>
                </Box>
                <Box style={{display: 'grid', width: "100%", justifyContent: 'center', gap: "24px"}}>
                    <Button className="btn use-another-url-btn" onClick={handleOnClickAnotherUrl}>Use Another URL</Button>
                </Box>
            </Box>
        </div>
    );
}

export default GifError;
