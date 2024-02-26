import React from 'react';
import { Popover, ListItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MicrosoftLogo from '../../resources/Microsoft_logo.png'
import GoogleLogo from '../../resources/Gmail_Logo.png'
import DeleteIcon from '@mui/icons-material/Delete';
import './ActionMenu.scss';

function ActionMenuPopover({ anchorEl, onClose, onSelect, isMobile }) {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <div className="action-menu-popover">
        {!isMobile && (
          <ListItem onClick={() => onSelect('Edit')}>
            Edit{' '}
            <span>
              <EditIcon />
            </span>
          </ListItem>
        )}
        <ListItem onClick={() => onSelect('Delete')}>
          Delete{' '}
          <span>
            <DeleteIcon />
          </span>
        </ListItem>
        <ListItem onClick={() => onSelect('ShareOutlook')}>
          Share with Outlook{' '}
          <span>
            <img src={MicrosoftLogo} alt="" />
          </span>
        </ListItem>
        <ListItem onClick={() => onSelect('ShareGmail')}>
          Share with Gmail{' '}
          <span>
            <img src={GoogleLogo} alt="" />
          </span>
        </ListItem>
      </div>
    </Popover>
  );
}

export default ActionMenuPopover;
