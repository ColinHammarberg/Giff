import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import './SendEmailComponent.scss';
import Header from './Header';

function SendEmailComponent(props) {
  const { onChange, gifGenerated, onKeyPress } = props;

  function handleOnChangeUrl(event) {
    if (onChange) {
      console.log('event', event);
      onChange(event?.target?.value)
    }
  }

  return (
    <div className="email-component">
      <Header generator />
      <Box className="email-content">
        <Box className="info-box">
            <TextField label="Add your name..." className="name" />
            <TextField label="Add your Company..." className="company" />
        </Box>
        <Box className="email-text-box">
            <TextField label="Add your email text..." className="email-text" />
        </Box>
        <Box className="email-address-box">
            <TextField label="Add email addresses you want to send your gif to..." className="email-address" />
        </Box>
      </Box>
      <Box className="btn-box">
        <Button className="btn preview-email">Preview Email</Button>
        <Button className="btn send-email">Send email</Button>
      </Box>
      <Box className="bottom-content">
            <Box className="go-back-content">
                Want to create another gif? <span className="back-btn">Go back to home page here</span>
            </Box>
     </Box>
    </div>
  );
}

export default SendEmailComponent;
