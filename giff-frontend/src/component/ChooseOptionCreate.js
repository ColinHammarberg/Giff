import React from 'react';
import './ChooseOptionCreate.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoButton from './InfoButton';

function ChooseOptionCreate() {
  const navigate = useNavigate();
  const infoButtonText = [
    {text: 'Create several gifs at once to download a catalog of gifs to share. It’s an awesome way to save time if you have a couple of pages, blog posts or whitepapers that you want to share with different people.'},
    {text: 'Create one gif if you have something specific you want to share with someone right away. If you want, our friendly AI Mrs. Gif-t can even help you with your emails.'}
  ]
  return (
        <div className="choose-option-create">
            <Header generator />
            <Box className="choose-option-create-info">
                <Box className="container">
                    <div className="title">
                        Hey, CHAMP. 
                    </div>
                    <div className="sub-title">
                        DO YO WANT TO create one or several gifs today? <InfoButton infoButtonText={infoButtonText} />
                    </div>
                </Box>
                <Box className="enter-btn">
                    <Button className="create-one" onClick={(() => setTimeout(() => navigate('/single-gif-creation')))}>Create one gif</Button>
                    <Button className="create-several" onClick={(() => setTimeout(() => navigate('/multiple-gif-creation')))} >Create several gifs</Button>
                </Box>
            </Box>
        </div>
  );
}

export default ChooseOptionCreate;
