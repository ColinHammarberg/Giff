import React, { useContext } from 'react';
import { Box, Button } from '@mui/material';
import './SendViaOwnEmail.scss';
import Header from './Header';
import { GiftContext } from '../context/GiftContextProvider';
import { useNavigate } from 'react-router-dom';

function SendViaOwnEmail() {
  const { handleDownloadClick } = useContext(GiftContext);
  const navigate = useNavigate();

  async function handleOnClickGoToEmail() {
    await handleDownloadClick()
    setTimeout(() => {
      const subject = "Check out this GIF!";
      const body = "I thought you might enjoy this GIF I created. Check it out: ";
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      navigate('/choose-option-create')
    }, 4000)
  }
  return (
    <div className="send-via-own-email">
      <Header menu />
      <Box className="container">
        <Box className="text-field-content">
            <div>
                You’ve got it, Champ. <span>Click the button  to download your gif and open your email service.</span> all you have to do is to &nbsp; 
                <span>add your gif to the email</span> &nbsp;and write a suiting text for it. <br></br>
                &nbsp; Piece of cake. &nbsp;Right, champ?
            </div>
        </Box>
        <Box className="action-box">
            <Button className="btn go-to-email" onClick={handleOnClickGoToEmail}>Go to email</Button>
        </Box>
      </Box>
    </div>
  );
}

export default SendViaOwnEmail;
