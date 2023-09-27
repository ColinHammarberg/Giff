import React from 'react';
import { Box, Button } from '@mui/material';
import './SendViaOwnEmail.scss';
import Header from './Header';

function SendViaOwnEmail() {
  return (
    <div className="send-via-own-email">
      <Header menu />
      <Box className="container">
        <Box className="text-field-content">
            <div>
                You’ve got it, Champ. <span>Click the button  to download your gif and open  your email service.</span> all you have to do is to 
                <span>add your gif to the email</span>and write a suiting text for it. 
                Piece of cake. Right, champ?
            </div>
        </Box>
        <Box className="action-box">
            <Button className="btn go-to-email">Go to email</Button>
        </Box>
      </Box>
    </div>
  );
}

export default SendViaOwnEmail;
