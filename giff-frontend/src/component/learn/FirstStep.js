import React from 'react';
import CreateGifStep from '../../resources/create-gif.png';
import InstallStep from '../../resources/install.png';
import { Button } from '@mui/material';
import MicrosoftLogo from '../../resources/Microsoft_logo.png';
import GoogleLogo from '../../resources/Gmail_Logo.png';

const FirstStep = ({ navigate }) => (
  <>
    <div className="left">
      <img src={CreateGifStep} alt="Create Gif" />
      <Button className="create-flow-btn" onClick={() => navigate('/single-gif-creation')}>Go to create a gif</Button>
    </div>
    <div className="right">
      <img src={InstallStep} alt="Install Step" />
      <div className="navigate-actions">
        <Button className="addon-btn" onClick={() => window.open('https://appsource.microsoft.com/en-us/product/office/WA200006594')}>
          <img src={MicrosoftLogo} alt="Microsoft logo" /> To Microsoft
        </Button>
        <Button className="addon-btn" onClick={() => window.open('https://workspace.google.com/marketplace/app/gift/537947018056?')}>
          <img src={GoogleLogo} alt="Google logo" /> To Google
        </Button>
      </div>
    </div>
  </>
);

export default FirstStep;
