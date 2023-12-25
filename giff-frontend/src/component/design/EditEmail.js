import React from 'react';
import './EditEmail.scss';

function EditEmail({ defaultEmail, onEmailChange }) {
  return (
    <div className="edit-email">
      <div className="example-email">
        <textarea
          id="emailInput"
          value={defaultEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          className="email-textarea"
          rows={15}
        />
      </div>
    </div>
  );
}

export default EditEmail;
