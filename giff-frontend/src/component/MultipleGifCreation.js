import React, { useState } from 'react';
import { Box } from '@mui/material';
import MultipleGifGenerator from './MultipleGifGenerator';
import './GifLanding.scss';
import GifError from './GifError';
import { DownloadFolder, GenerateMultipleGifs, GenerateMultiplePdfGifs } from '../endpoints/Apis';
import MultipleGeneratedGifs from './MultipleGeneratedGifs';

function MultipleGifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateNames, setDuplicateNames] = React.useState({});
  const [urlList, setUrlList] = useState([
    { name: '', url: '' },
    { name: '', url: '' },
  ]);

  const generateMultipleGifs = async () => {
    console.log('duplicateNames', duplicateNames);
    if (Object.values(duplicateNames).some(value => value === true)) {
      return;
    } else {
      try {
        setIsLoading(true);
        // Determine the GIF type (PDF or regular)
        const sanitizedUrlList = urlList.map((item) => ({
          url: item.url.startsWith('http://') || item.url.startsWith('https://')
            ? item.url
            : `https://${item.url}`,
          name: item.name,
        }));
  
        // Separate PDF and non-PDF URLs
        const pdfUrls = sanitizedUrlList.filter((item) => item.url.endsWith('.pdf'));
        const nonPdfUrls = sanitizedUrlList.filter((item) => !item.url.endsWith('.pdf'));
  
        // Declare variables to store responses
        let pdfResponse;
        let nonPdfResponse;
  
        // Call the appropriate generation functions
        if (pdfUrls.length > 0) {
          pdfResponse = await GenerateMultiplePdfGifs(pdfUrls);
        }
  
        if (nonPdfUrls.length > 0) {
          nonPdfResponse = await GenerateMultipleGifs(nonPdfUrls);
        }
  
        console.log('pdfResponse', pdfResponse);
        console.log('nonPdfResponse', nonPdfResponse);
  
        // Create an array to accumulate response data
        let data = [];
  
        // Merge PDF response data into the array
        if (pdfResponse && pdfResponse.data.data) {
          data = data.concat(pdfResponse.data.data);
        }
  
        // Merge non-PDF response data into the array
        if (nonPdfResponse && nonPdfResponse.data.data) {
          data = data.concat(nonPdfResponse.data.data);
        }
  
        // Handle errors as needed
        if (pdfResponse?.data.error || nonPdfResponse?.data.error) {
          const errorMessage = (pdfResponse?.data.error || nonPdfResponse?.data.error) || '';
          if (errorMessage.includes("Invalid scroll height")) {
            setError('height error');
          } else if (errorMessage.includes("video")) {
            setError('video error');
          } else {
            setError('general error');
          }
        }
  
        // Set gifGenerated with the merged data array
        if (data.length > 0) {
          setGifGenerated(data);
        }
  
        setIsLoading(false);
      } catch (error) {
        setError('general error');
        setIsLoading(false);
      }
    }
  };

  async function handleDownloadClick() {
    if (gifGenerated) {
      setIsLoading(true);
      try {
        const response = await DownloadFolder(); // Make sure DownloadFolder sets responseType to 'blob'
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        setTimeout(() => {
          link.href = url;
          link.target = '_blank';
          link.download = 'your-gift-bag.zip';
          link.click();
          window.URL.revokeObjectURL(url);
          setIsLoading(false);
        }, 3000)
      } catch (error) {
        console.error('Error downloading ZIP file:', error);
      }
    }
  }
  

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      generateMultipleGifs();
    }
  };

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} variant={error} setError={setError} />
      </div>
    );
  }

  console.log('isLoading', isLoading);

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
        <MultipleGeneratedGifs
          gifGenerated={gifGenerated}
          isLoading={isLoading}
          onDownload={handleDownloadClick}
          urlList={urlList}
        />
      ) : (
        <MultipleGifGenerator
          urlList={urlList}
          setUrlList={setUrlList}
          onKeyPress={handleKeyPressGenerateGif}
          gifGenerated={gifGenerated}
          duplicateNames={duplicateNames}
          setDuplicateNames={setDuplicateNames}
          generateMultipleGifs={generateMultipleGifs}
        />
      )}
      {!isLoading && (
        <Box className="bottom-content">
          {gifGenerated && (
            <Box className="go-back-content">
              Want to create another gif?{' '}
              <span className="back-btn" onClick={() => setGifGenerated(false)}>
                Go back to home page here
              </span>
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

export default MultipleGifLanding;
