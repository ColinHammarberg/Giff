import React, { useState } from 'react';
import Header from '../overall/Header';
import './Tutorial.scss';
import FirstStep from './FirstStep'; // Assuming the steps are in the same directory for simplicity
import SecondStep from './SecondStep';
import { Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import BackButton from '../profile/BackButton';

const Tutorial = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <div className="tutorial">
      <Header menu />
      <div className="content">
        <div className="title">
        {step === 1 && <BackButton onClick={() => setStep(0)} />}
            How you use gif-t
        </div>
        <div className="step-content">
          {step === 0 ? <FirstStep navigate={navigate} /> : <SecondStep navigate={navigate} />}
          {step === 0 && (
            <Button className="next-btn" onClick={() => setStep(step => step + 1)}>Next <PlayArrowIcon /></Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
