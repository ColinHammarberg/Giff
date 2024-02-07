import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import './Tag.scss';
import { IconButton } from '@mui/material';

function Tag({ label, variant, color, onClick, onRemove, selected }) {
  console.log('selected', selected);
  return (
    <span
      className={`tag ${variant}`}
      style={{ border: `2px solid ${color}` }}
      onClick={onClick}
    >
      {label}
      {selected && (
        <div className="selected">
          <CheckIcon className="confirm" />
        </div>
      )}
      {onRemove && (
        <IconButton onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      )}
    </span>
  );
}

export default Tag;
