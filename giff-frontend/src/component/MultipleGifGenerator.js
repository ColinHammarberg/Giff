import React from 'react';
import { Box, InputLabel, TextField, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import './MultipleGifGenerator.scss';
import InfoButton from './InfoButton';
import Header from './Header';

function MultipleGifGenerator(props) {
  const { urlList, setUrlList, gifGenerated } = props;

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
    const { value } = event.target;

    setUrlList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = { ...updatedList[index], name: value };
      return updatedList;
    });
  }

  function addUrl() {
    setUrlList((prevList) => [...prevList, { name: '', url: '' }]);
  }

  return (
    <div className="multiple-gif-generator">
      <Header generator />
      <Box className="text-field-content">
        <div className="text-field-header">
          Add any* urls <InfoButton infoButtonText={infoButtonText} />
        </div>
        <Box className="url-inputs">
          {urlList.map((item, index) => (
            <Box key={index}>
              <div>
                <InputLabel shrink htmlFor={`name-input-${index}`}>
                  Name of file
                </InputLabel>
                <TextField
                  id={`name-input-${index}`}
                  onChange={(event) => handleNameChange(event, index)}
                  value={item.name}
                  placeholder="Name of gif"
                />
              </div>
              <div>
                <InputLabel shrink htmlFor={`url-input-${index}`}>
                  URL
                </InputLabel>
                <TextField
                  id={`url-input-${index}`}
                  onChange={(event) => handleOnChangeUrl(event, index)}
                  value={item.url}
                  placeholder="https://give-a-gif-t.com"
                />
              </div>
            </Box>
          ))}
          <Button onClick={addUrl}>Add URL</Button>
        </Box>
      </Box>
      <div className="gifs">{gifGenerated && <img src={Gif} alt="Generated GIF" />}</div>
    </div>
  );
}

export default MultipleGifGenerator;
