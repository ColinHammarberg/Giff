import React, { useContext } from 'react';
import { Box, Button, InputLabel, TextField } from '@mui/material';
import './SendEmailComponent.scss';
import Header from './Header';
import { GiftContext } from '../context/GiftContextProvider';

function SendEmailComponent(props) {
  const { onChange, sendGif } = useContext(GiftContext); // Get the context value

  // Use the shared onChange function for all fields
  function handleInputChange(event, fieldIdentifier) {
    if (onChange) {
      const value = event.target.value;
      onChange(fieldIdentifier, value);
    }
  }

  async function handleSendEmail() {
    const sendEmail = await sendGif();
    return sendEmail;
  }

  return (
    <div className="email-component">
      <Header generator />
      <Box className="email-content">
        <Box className="info-box">
          <div className="input">
            <InputLabel shrink htmlFor="text-input">
              Name
            </InputLabel>
            <TextField onChange={(event) => handleInputChange(event, 'html_content')} placeholder="Mark Lunneberg" className="name" />
          </div>
          <div className="input">
            <InputLabel shrink htmlFor="text-input">
              Company name
            </InputLabel>
            <TextField onChange={(event) => handleInputChange(event, 'global_substitutions')} placeholder="Gift" className="company" />
          </div>
        </Box>
        <Box className="email-text-box">
          <div className="input">
            <InputLabel shrink htmlFor="text-input">
              Email message
            </InputLabel>
            <TextField onChange={(event) => handleInputChange(event, 'plain_text_content')} placeholder="Lorem epsum" className="email-text" />
          </div>
        </Box>
        <Box className="email-address-box">
          <div className="input">
            <InputLabel shrink htmlFor="text-input">
              Email
            </InputLabel>
            <TextField onChange={(event) => handleInputChange(event, 'emailAddresses')} placeholder="testing.testing@gift.com" className="email-address" />
          </div>
        </Box>
      </Box>
      <Box className="btn-box">
        <Button className="btn preview-email">Preview Email</Button>
        <Button className="btn send-email" onClick={handleSendEmail}>Send email</Button>
      </Box>
      <Box className="bottom-content">
        <Box className="go-back-content">
          Want to create another gif? <span className="back-btn">Go back to the home page here</span>
        </Box>
      </Box>
    </div>
  );
}

export default SendEmailComponent;
