import React from 'react';
import { Popover, ListItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import IosShareIcon from '@mui/icons-material/IosShare';
import DeleteIcon from '@mui/icons-material/Delete';
import './ActionMenu.scss';

function ActionMenuPopover({ anchorEl, onClose, onSelect }) {
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
        <ListItem onClick={() => onSelect('Edit')}>
          Edit{' '}
          <span>
            <EditIcon />
          </span>
        </ListItem>
        <ListItem onClick={() => onSelect('Delete')}>
          Delete{' '}
          <span>
            <DeleteIcon />
          </span>
        </ListItem>
        <ListItem onClick={() => onSelect('Download')}>
          Download{' '}
          <span>
            <DownloadIcon />
          </span>
        </ListItem>
        <ListItem onClick={() => onSelect('Share')}>
          Share{' '}
          <span>
            <IosShareIcon />
          </span>
        </ListItem>
      </div>
    </Popover>
  );
}

export default ActionMenuPopover;
