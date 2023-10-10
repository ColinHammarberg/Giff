import React, { useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import './MultipleGeneratedGifs.scss';
import Header from './Header';
import LoadingGif from './LoadingGif';

function MultipleGeneratedGifs(props) {
  const { gifGenerated, isLoading, onDownload, urlList } = props;
  const [importedGifs, setImportedGifs] = useState([]);

  React.useEffect(() => {
    // Dynamically import the GIFs when the component mounts
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
      <Header menu />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} className="multiple-gifs">
            {gifGenerated && renderImportedGifs()}
          </Grid>
          <Box>
            <Button onClick={onDownload}>Download Gifs</Button>
          </Box>
        </>
      )}
    </div>
  );
}

export default MultipleGeneratedGifs;
