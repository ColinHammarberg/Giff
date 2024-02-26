import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './Tag.scss';
import { IconButton } from '@mui/material';

function Tag({ label, variant, color, onClick, onRemove, selected, disabled }) {
  console.log('selected', selected);
  return (
    <span
      className={`tag ${variant} ${disabled && 'disabled'} `}
      style={{
        border: `2px solid ${color}`,
        backgroundColor: selected ? color : '',
      }}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <IconButton onClick={onRemove}>
          <DeleteIcon />
        </IconButton>
      )}
    </span>
  );
}

export default Tag;
