import React from 'react';
import { Box, Button } from '@mui/material';
import './GifError.scss';
import Header from './Header';
import ErrorImage from '../resources/Error.png';

function GifError(props) {
    function handleOnClickAnotherUrl() {
        props.setError(null);
        props.setGifGenerated(null);
    }
    return (
        <div className="gif-error">
        <Header />
            <Box className="error-container">
            <Box>
                <img src={ErrorImage} alt="" className="error-img" />
            </Box>
            <Box className="error-description-box">
                <div className="error-description">
                    The URL you used leads somewhere that only has one page and that cannot be scrolled. 
                    We need a couple of pages for our gif machine (aka. the gif-ter) to scroll through. 
                    With only one page we can only give you an image, and we’re fairly sure you haven’t come here for that. 
                </div>
                <div className="orange-divider">
                    Please use a Url that can be scrolled
                </div>
            </Box>
            <Box>
                <Button className="use-another-url-btn" onClick={handleOnClickAnotherUrl}>Use Another url</Button>
            </Box>
            </Box>
        </div>
    );
}

export default GifError;
