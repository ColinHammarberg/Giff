import React from 'react';
import { Box, Popover, Button, Typography } from '@mui/material';
import './ExampleEmailPopover.scss';

function ExampleEmailPopover({ open, anchorEl, content, onClose }) {
  const handleGmailRedirect = () => {
    window.open('https://www.gmail.com', '_blank');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      className="example-email-popover"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box onClick={onClose} style={{ cursor: 'pointer', padding: '10px', textAlign: 'right' }}>Close</Box>
      <Box style={{ padding: '10px', width: '300px', height: '140px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', textAlign: 'center' }}>
          {content}
        </Typography>
        <Box style={{ display: 'flex', width: '280px', margin: 'auto'}} >
            <Button onClick={handleGmailRedirect} style={{ backgroundColor: '#F4149B', color: '#000', marginTop: '30px' }}>
                Share now
            </Button>
            <Button onClick={onClose} style={{ backgroundColor: '#000000', color: '#FEC901', marginTop: '30px' }}>
                Nah! Later
            </Button>
        </Box>
      </Box>
    </Popover>
  );
}

export default ExampleEmailPopover;
