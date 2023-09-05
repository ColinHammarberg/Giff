import React, { useContext } from 'react';
import { Box, Button, TextField } from '@mui/material';
import './SendEmailComponent.scss';
import Header from './Header';
import { GiftContext } from '../context/GiftContextProvider';

function SendEmailComponent(props) {
  const { onChange } = useContext(GiftContext); // Get the context value

  // Use the shared onChange function for all fields
  function handleInputChange(event, fieldIdentifier) {
    if (onChange) {
      const value = event.target.value;
      onChange(fieldIdentifier, value);
    }
  }

  return (
    <div className="email-component">
      <Header generator />
      <Box className="email-content">
        <Box className="info-box">
          <TextField onChange={(event) => handleInputChange(event, 'name')} label="Add your name..." className="name" />
          <TextField onChange={(event) => handleInputChange(event, 'company')} label="Add your Company..." className="company" />
        </Box>
        <Box className="email-text-box">
          <TextField onChange={(event) => handleInputChange(event, 'email-text')} label="Add your email text..." className="email-text" />
        </Box>
        <Box className="email-address-box">
          <TextField onChange={(event) => handleInputChange(event, 'email-address')} label="Add email addresses you want to send your gif to..." className="email-address" />
        </Box>
      </Box>
      <Box className="btn-box">
        <Button className="btn preview-email">Preview Email</Button>
        <Button className="btn send-email">Send email</Button>
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
