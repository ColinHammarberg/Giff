import React from 'react';
import './Spinner.scss';

function Spinner({ title, onClick }) {
    return (
        <div className="spinner-container" onClick={onClick}>
            <div className="spinner">
                <div className="spinner-title">{title}</div>
            </div>
        </div>
    );
}

export default Spinner;