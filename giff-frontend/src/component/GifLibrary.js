import React, { useEffect, useState } from 'react';
import './GifLibrary.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { DownloadAllLibraryGifs, FetchUserGifs } from '../endpoints/Apis';
import { useNavigate } from 'react-router-dom';

function GifLibrary() {
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
      const access_token = localStorage.getItem('access_token');
      const fetchData = async () => {
        const response = await FetchUserGifs(access_token);
        console.log('response', response);
        if (response.data) {
          setGifs(response.data);
        }
      };
      fetchData();
      }, []);
      const handleDownloadLibraryGifs = async () => {
        if (!gifs) {
          return;
        }
        const gifUrls = gifs.data.map(gif => gif.url);
        try {
          const response = await DownloadAllLibraryGifs(gifUrls);
          
          // Create a blob from the response data
          const blob = new Blob([response.data], { type: 'application/zip' });
          
          // Create a URL for the blob and trigger the download
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'your-gift-bag.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (error) {
          console.error('Error downloading ZIP file:', error);
        }
      };
    console.log('gifs', gifs);
  return (
    <div className="gif-library">
      <Header menu />
      <Box className="gif-showcase">
        <Box className="gif-showcase-info">
          <Box className="title"><span>This is your library.</span> download all gifs at once <span>or</span> hover over the gif you want to download or share.</Box>
          <Box className="download">{gifs?.data?.length > 0 ? <Button onClick={handleDownloadLibraryGifs}>Download all gifs</Button> : <Button onClick={() => navigate('/choose-option-create')}>Create gifs</Button> }</Box>
        </Box>
          <Box className="gif-wrapper">
            {gifs?.data?.map((item, index) => {
              return (
                <Box
                  className="gif-box" 
                >
                  <Box 
                    className={`gif-container ${selectedGif === index ? 'hovered' : ''}`} 
                    onMouseEnter={() => setSelectedGif(index)}
                    onMouseLeave={() => setSelectedGif(null)}
                  >
                    <img src={item.url} alt="" />
                    <Box className="gif-buttons">
                      <Button className="download">Download</Button>
                      <Button className="share">Share</Button>
                    </Box>
                  </Box>
                  <span>{item.name}</span>
                </Box>
              )
            })}
          </Box>
      </Box>
    </div>
  );
}

export default GifLibrary;
