import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import './Tag.scss';
import { IconButton } from '@mui/material';

function Tag({ label, variant, color, onClick, onRemove }) {
    return (
        <span className={`tag ${variant}`} style={{backgroundColor: color && color }} onClick={onClick}>
            {label}
            {onRemove && <IconButton onClick={onRemove}><DeleteIcon /></IconButton>}
        </span>
    )
}

export default Tag;