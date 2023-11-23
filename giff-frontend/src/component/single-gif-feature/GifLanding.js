import React, { useContext, useRef, useState } from 'react';
import SingleGifGenerator from './SingleGifGenerator';
import { Box } from '@mui/material';
import GeneratedGif from './GeneratedGif';
import GifError from '../error-handling/GifError';
import { GeneratePdfGifs, GenerateSingleGif } from '../../endpoints/Apis';
import { GiftContext } from '../../context/GiftContextProvider';
import VerifyAccountDialog from '../authorization/VerifyAccountDialog';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const { handleDownloadClick, user } = useContext(GiftContext);
  const formRef = useRef();
  const isActive = user?.userInfo?.is_active;

  const handleOnChangeUrl = (value) => {
    setUrl(value);
  };

  const handleErrors = (errorMessage) => {
    setError(errorMessage);
  };

  const handlePdfChange = (e) => {
    setSelectedPdf(e.target.files[0]);
  };

  const handleCreateGifClick = () => {
    formRef.current.submit();
  };

  console.log('isActive', isActive);

  const generateSingleGif = async () => {
    if (!isActive) {
      // show popup asking them to verify their account
      const { hasConfirmed } = await VerifyAccountDialog.show();
      if (hasConfirmed) {
        return;
      }
    } else {
      setIsLoading(true);
      try {
        setIsLoading(true);
        const newUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        const response = await (newUrl.endsWith('.pdf') ? GeneratePdfGifs(newUrl) : GenerateSingleGif(newUrl));
        console.log('response', response);
        if (response?.data?.error) {
          handleErrors(response.data.error);
        } else if (response.data.message === 'GIF generated and uploaded!') {
          const responseData = response.data;
          setGifGenerated(responseData.data);
        }
        setIsLoading(false);
      } catch (error) {
        handleErrors('general error')
        setIsLoading(false);
      }
    setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} variant={error} setError={setError} />
      </div>
    )
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
        <GeneratedGif key={gifGenerated} url={url} gifGenerated={gifGenerated} isLoading={isLoading} onDownload={handleDownloadClick} />
      ) : (
        <SingleGifGenerator
          onChange={handleOnChangeUrl}
          generateSingleGif={generateSingleGif}
          handleCreateGifClick={handleCreateGifClick}
          gifGenerated={gifGenerated}
          selectedPdf={selectedPdf}
          setIsLoading={setIsLoading}
          setGifGenerated={setGifGenerated}
          setSelectedPdf={setSelectedPdf}
          handlePdfChange={handlePdfChange}
          ref={formRef}
        />
      )}
      {!isLoading && (
        <Box className="bottom-content">
          {gifGenerated && (
            <Box className="go-back-content">
              Want to create another gif? <span className="back-btn" onClick={() => { setGifGenerated(null); }}>Go back to home page here</span>
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

export default GifLanding;
