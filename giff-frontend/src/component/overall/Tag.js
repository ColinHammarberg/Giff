import React from 'react';
import './Tag.scss';

function Tag({ label, variant, color, onClick }) {
    return (
        <span className={`tag ${variant}`} style={{backgroundColor: color && color }} onClick={onClick}>{label}</span>
    )
}

export default Tag;