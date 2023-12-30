import React, { PureComponent } from 'react';
import { Box, Button, Popover } from '@mui/material';
import './DeleteGifPopover.scss';

class DeleteGifPopover extends PureComponent {
  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  handleConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  };

  render() {
    const { open, anchorEl, onClose } = this.props;

    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        className="delete-gif-popover"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'top',
        }}
      >
        <Box className="delete-gif-content">
          Are you sure, Champ? <br />
          <br />
          Deleting your gif will mean it’s gone for good.
        </Box>
        <Box className="delete-btn-actions">
          <Button onClick={this.handleConfirm} className="confirm-btn">
            Delete my gif
          </Button>
          <Button onClick={this.handleCancel} className="keep-gif-btn">
            Let's keep my gif
          </Button>
        </Box>
      </Popover>
    );
  }
}

export default DeleteGifPopover;
