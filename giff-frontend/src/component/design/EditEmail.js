import React from 'react';
import './EditEmail.scss';

function EditEmail({ defaultEmail, onEmailChange, placeholder }) {
  return (
    <div className="edit-email">
      <div className="example-email">
        <textarea
          id="emailInput"
          placeholder={placeholder}
          value={defaultEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="email-textarea"
          rows={15}
          style={{ outline: 'none' }}
        />
      </div>
    </div>
  );
}

export default EditEmail;
