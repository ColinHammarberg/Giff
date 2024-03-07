import React from 'react';
import Launch from '../../resources/launch.png';
import { Button } from '@mui/material';

const SecondStep = ({ navigate }) => (
  <div className="second-step">
    <img src={Launch} alt="Launch" />
    <Button className="get-started-btn" onClick={() => navigate('/single-gif-creation')}>Let’s get going</Button>
    <div className="info">
        Pssst.... don’t know how to install and use add ons? 
        No need to feel ashamed just follow one of the links to get instructions 
    </div>
  </div>
);

export default SecondStep;
