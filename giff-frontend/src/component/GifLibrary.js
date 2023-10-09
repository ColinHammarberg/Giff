import React, { useEffect, useState } from 'react';
import './GifLibrary.scss';
import Header from './Header';
import { Box } from '@mui/material';
import { FetchUserGifs, FetchUserInfo } from '../endpoints/Apis';

function GifLibrary() {
    const [userInfo, setUserInfo] = useState(null);
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
    <div className="profile">
      <Header menu />
        <Box className="title">Profile</Box>
    </div>
  );
}

export default GifLibrary;
