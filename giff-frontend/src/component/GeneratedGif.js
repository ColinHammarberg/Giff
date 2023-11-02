import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import './GeneratedGif.scss';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import LoadingGif from './LoadingGif';
import OfficialButton from './OfficialButton';
import { GetMultipleGifs } from '../endpoints/Apis';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, onDownload, key } = props;
  const navigate = useNavigate();
  const [importedGifs, setImportedGifs] = useState(null);


  useEffect(() => {
    if (gifGenerated) {
      const fetchData = async () => {
        const response = await GetMultipleGifs(gifGenerated);
        if (response.data) {
          setImportedGifs(response.data)
        }
      };
      fetchData();
    }
  }, [gifGenerated]);

  return (
    <div className="generated-gif" key={key}>
      <Header menu />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif singleGif />
        </Box>
      ) : (
        <>
        <Box className="title">Your gif is ready. It looks great.</Box>
        {gifGenerated && importedGifs?.length > 0 && (
          <Box className="gif">
            {importedGifs.map((gif) => {
              return (
                <img src={gif?.url} alt="Generated GIF" />
              )
            })}
          </Box>
        )}  
          <Box className="generated-gif-btn-box">
            <OfficialButton variant="yellow" label="Download GIF" onClick={onDownload} />
            <OfficialButton variant="green" label="Share gif in email" onClick={() => navigate('/email-choice')} />
            <OfficialButton variant="pink" label="Share gif elsewhere" />
          </Box>
        </>
      )}
    </div>
  );
}

export default GeneratedGif;
