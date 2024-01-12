import React, { useState } from 'react';
import { IconButton, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

function EditGifName({ initialName, onNameChange, onNameSubmit }) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(initialName);

  const handleEditName = () => setEditingName(true);

  const handleCancelEdit = () => {
    setEditingName(false);
    setNewName(initialName);
  };

  const handleSubmit = () => {
    setEditingName(false);
    if (newName !== initialName) {
      onNameChange(newName);
      onNameSubmit();
    }
  };

  return (
    <div className="gif-name-edit">
      {editingName ? (
        <>
          <TextField
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            InputProps={{
              endAdornment: (
                <>
                  <IconButton onClick={handleSubmit}>
                    <CheckIcon className="confirm" />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit}>
                    <CloseIcon className="close" />
                  </IconButton>
                </>
              ),
            }}
          />
        </>
      ) : (
        <>
          <span>{initialName}</span>
          <IconButton onClick={handleEditName}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </div>
  );
}

export default EditGifName;
