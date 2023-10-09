import React, { useEffect, useState } from 'react';
import './GifLibrary.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { FetchUserGifs, FetchUserInfo } from '../endpoints/Apis';

function GifLibrary() {
    const [userInfo, setUserInfo] = useState(null);
    const [selectedGif, setSelectedGif] = useState(null);
    const gifDummyData = [
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
      {url: 'https://gift-resources.s3.eu-north-1.amazonaws.com/13/your_gift-13.gif', name: 'www.gif-t.com'},
    ]
    useEffect(() => {
        const fetchData = async () => {
          const response = await FetchUserInfo();
          console.log('response', response);
          if (response) {
            setUserInfo(response.data);
          }
        };
        fetchData();
      }, []);
    console.log('userInfo', userInfo);
  return (
    <div className="gif-library">
      <Header menu />
      <Box className="gif-showcase">
        <Box className="gif-showcase-info">
          <Box className="title"><span>This is your library.</span> download all gifs at once <span>or</span> hover over the gif you want to download or share.</Box>
          <Box className="download"><Button>Download all gifs</Button></Box>
        </Box>
          <Box className="gif-wrapper">
            {gifDummyData.map((item, index) => {
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
