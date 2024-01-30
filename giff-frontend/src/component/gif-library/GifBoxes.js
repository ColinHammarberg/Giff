import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, TextField } from '@mui/material';
import './GifBoxes.scss';
import LightTooltip from '../overall/LightToolTip';

function GifBoxes({
  name,
  onClickMore,
  onClickGif,
  gifUrl,
  onMouseEnter,
  onClickDownload,
  index,
  onNameChange,
  onNameSubmit,
  totalClicks,
}) {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleEditName = () => {
    setEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditingName(false);
    setNewName(name);
  };

  const handleSubmit = () => {
    setEditingName(false);
    if (newName !== name) {
      onNameChange(newName);
      onNameSubmit();
    }
  };

  return (
    <div onMouseEnter={onMouseEnter} onClick={onClickGif}>
      <div className="gif-header" style={{ backgroundColor: '#3F3F3F' }}>
        <LightTooltip
          title={`This gif has been clicked on a total of ${
            totalClicks || 0
          } times in your email communications.`}
          placement="top"
        >
          <div className="gif-clicks-count">{totalClicks || 0}</div>
        </LightTooltip>
        <div className="name">
          {editingName ? (
            <>
              <TextField
                type="text"
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
              <span>{name}</span>
              <IconButton onClick={handleEditName}>
                <EditIcon className="edit" />
              </IconButton>
            </>
          )}
        </div>
        <div>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClickMore(e);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className="frame">
        <img src={gifUrl} alt="" />
        <LightTooltip title={`Download ${name}`} placement="bottom-start">
          <IconButton
            className="download-icon"
            onClick={() => onClickDownload(index)}
          >
            <DownloadIcon />
          </IconButton>
        </LightTooltip>
      </div>
    </div>
  );
}

export default GifBoxes;
