import React from 'react';
import { Box, InputLabel, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import './MultipleGifGenerator.scss';
import InfoButton from './InfoButton';
import Header from './Header';
import { showNotification } from './Notification';
import LightTooltip from './LightToolTip';
import OfficialButton from './OfficialButton';
import MultipleGifCreationDialog from './MultipleGifCreationDialog';

function MultipleGifGenerator(props) {
  const { urlList, setUrlList, setDuplicateNames, duplicateNames, gifGenerated, generateMultipleGifs } = props;
  
  const infoButtonText = [
    {
      text: 'With Gif-t, you can create a gif from an online pdf, web page or presentation. Simply add the url and click Create gif.',
    },
    {
      text: 'Our gif-machine (AKA the Gif-ter) will scroll through the place your url leads to, create a gif and make it ready for you to share.',
    },
    {
      text: 'Your url needs to lead somewhere scrollable (it can’t just be one page, like google.com), and it cannot be locked behind a login or verification (like a sharepoint or a pay-walled magazine).',
    },
  ];

  function handleOnChangeUrl(event, index) {
    const { value } = event.target;
    setUrlList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = { ...updatedList[index], url: value };
      return updatedList;
    });
  }

  function handleNameChange(event, index) {
    const newName = event.target.value;
    const isDuplicate = urlList.some((item, idx) => idx !== index && item.name === newName);
  
    // Update duplicateNames state
    setDuplicateNames(prev => ({
      ...prev,
      [index]: isDuplicate
    }));
  
    // Update the list
    setUrlList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = { ...updatedList[index], name: newName };
      return updatedList;
    });
  }
  

  function addUrl() {
    if (urlList.length === 10) {
      return MultipleGifCreationDialog.show();
    }
    if (urlList.length < 10) {
      setUrlList((prevList) => [...prevList, { name: '', url: '' }]);
    } else {
      showNotification('error', "You can't create more than 8 gifs at once.")
    }
  }

  function removeItem(indexToRemove) {
    if (urlList.length <= 2) {
      return;
    } else {
      setUrlList((prevList) => {
        return prevList.filter((_, index) => index !== indexToRemove);
      });
    }
  }

  return (
    <div className="multiple-gif-generator">
      <Header menu />
      <Box className="text-field-content">
        <div className="text-field-header">
          Add your urls and name them <InfoButton infoButtonText={infoButtonText} />
        </div>
        <Box className="url-inputs">
          {urlList.map((item, index) => (
            <Box key={index} className="input-fields">
            <div className="inputs">
              <div>
                  <InputLabel shrink htmlFor={`url-input-${index}`}>
                    URL
                  </InputLabel>
                  <TextField
                    id={`url-input-${index}`}
                    onChange={(event) => handleOnChangeUrl(event, index)}
                    value={item.url}
                    placeholder="The url goes here..."
                  />
                </div>
                  <div>
                    <InputLabel shrink htmlFor={`name-input-${index}`}>
                      Name of file
                    </InputLabel>
                    <TextField
                      id={`name-input-${index}`}
                      error={duplicateNames[index]}
                      helperText={duplicateNames[index] ? "Name already exists" : ""}
                      className="name-input"
                      onChange={(event) => handleNameChange(event, index)}
                      value={item.name}
                      placeholder="The name goes here..."
                  />
                </div>
              </div>
              <LightTooltip title={urlList.length <= 2 ? "You can't remove the last two items" : "Remove item"}>
              <IconButton onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </LightTooltip>
          </Box>
        ))}
          <div className="add-btn">
            <LightTooltip title="Add field">
              <div>
                <IconButton onClick={addUrl}><AddIcon /></IconButton>
              </div>
            </LightTooltip>
          </div>
        </Box>
        <Box className="btn-content">
          {!gifGenerated && (
            <OfficialButton label={`Create ${urlList.length} GIFS`} onClick={generateMultipleGifs} variant="yellow" />
          )}
      </Box>
      </Box>
    </div>
  );
}

export default MultipleGifGenerator;
