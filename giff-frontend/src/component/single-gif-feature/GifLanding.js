import React, { useContext, useRef, useState } from 'react';
import SingleGifGenerator from './SingleGifGenerator';
import { Box } from '@mui/material';
import GeneratedGif from './GeneratedGif';
import GifError from '../error-handling/GifError';
import { GiftContext } from '../../context/GiftContextProvider';
import VerifyAccountDialog from '../authorization/VerifyAccountDialog';
import { GeneratePdfGifs, GenerateSingleGif } from '../../endpoints/GifCreationEndpoints';
import useFetchUser from '../../queries/useUserDataQuery';
import SectorTypeDialog from './SectorTypeDialog';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { handleDownloadClick } = useContext(GiftContext);
  const { user } = useFetchUser();
  const formRef = useRef();
  const isActive = user?.is_active;
  const isEmailCreationActive = user?.include_example_email;
  const [sectorType, setSectorType] = useState('');
  const [isSectorDialogOpen, setSectorDialogOpen] = useState(false);

  const handleSectorSubmit = () => {
    setSectorDialogOpen(false);
  };

  const handleOnChangeUrl = (value) => {
    setUrl(value);
  };

  const handleErrors = (errorMessage) => {
    setError(errorMessage);
  };

  const handlePdfChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCreateGifClick = () => {
    if (!sectorType && isEmailCreationActive) {
      setSectorDialogOpen(true);
    } else {
      formRef.current.submit(sectorType);
    }
  };

  const generateSingleGif = async () => {
    if (!isActive) {
      // show popup asking them to verify their account
      const { hasConfirmed } = await VerifyAccountDialog.show();
      if (hasConfirmed) {
        return;
      }
    } else {
      if (!sectorType && isEmailCreationActive) {
        setSectorDialogOpen(true);
      } else {
          setIsLoading(true);
          try {
            setIsLoading(true);
            const newUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
            const response = await (newUrl.endsWith('.pdf') ? GeneratePdfGifs(newUrl, sectorType) : GenerateSingleGif(newUrl, sectorType));
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
        <>
          <SectorTypeDialog 
            sectorType={sectorType} 
            setSectorType={setSectorType} 
            handleSectorSubmit={handleSectorSubmit} 
            isSectorDialogOpen={isSectorDialogOpen} 
            setSectorDialogOpen={setSectorDialogOpen} 
          />
          <SingleGifGenerator
            onChange={handleOnChangeUrl}
            generateSingleGif={generateSingleGif}
            handleCreateGifClick={handleCreateGifClick}
            gifGenerated={gifGenerated}
            selectedFile={selectedFile}
            setIsLoading={setIsLoading}
            setGifGenerated={setGifGenerated}
            setSelectedFile={setSelectedFile}
            handlePdfChange={handlePdfChange}
            sectorType={sectorType}
            ref={formRef}
          />
        </>
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
