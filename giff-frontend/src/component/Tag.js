import React from 'react';
import './Tag.scss';

function Tag({ label, variant }) {
    return (
        <span className={`tag ${variant}`}>{label}</span>
    )
}

export default Tag;