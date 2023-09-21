import React, { useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import './MultipleGeneratedGifs.scss';
import CircularWithValueLabel from './Loading';
import Header from './Header';

function MultipleGeneratedGifs(props) {
  const { gifGenerated, isLoading, onDownload, urlList } = props;
  const [importedGifs, setImportedGifs] = useState([]);

  React.useEffect(() => {
    // Dynamically import the GIFs when the component mounts
    console.log('urlList', urlList);
    const importGifs = async () => {
      const importedGifs = await Promise.all(
        urlList.map((item) => import(`../gifs/${item.name}.gif`))
      );
      setImportedGifs(importedGifs);
    };

    if (gifGenerated) {
      importGifs();
    }
  }, [gifGenerated, urlList]);

  const renderImportedGifs = () => {
    return importedGifs.map((gif, index) => (
      <Box className="gif" key={index}>
        <div>
          <img
            src={gif.default} // Use the 'default' property to get the actual imported image URL
            alt={`Generated GIF ${index}`}
            className="generated-gif"
          />
        </div>
        <div className="file-info">
          {/* <p className="gif-url">{urlList[index].url}</p> */}
          <p className="gif-url">{urlList[index].name}</p>
        </div>
      </Box>
    ));
  };

  return (
    <div className="multiple-generated-gif">
      <Header />
      {isLoading ? (
        <Box className="loading-container">
          <CircularWithValueLabel />
        </Box>
      ) : (
        <Grid container spacing={2} className="multiple-gifs">
          {gifGenerated && renderImportedGifs()}
          <Box>
            <Button onClick={onDownload}>Download Gifs</Button>
          </Box>
        </Grid>
      )}
    </div>
  );
}

export default MultipleGeneratedGifs;
