import React, { useEffect, useState } from 'react';
import './GifLibrary.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { DownloadAllLibraryGifs, FetchUserGifs } from '../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from './DesignGifDialog';
import { useTabs } from './Tabs';

function GifLibrary() {
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null);
    const [designChanges, setDesignChanges] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDesignOpen, setIsDesignOpen] = useState(false);
    const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design' ]);
    const [selectedDesignGif, setSelectedDesignGif] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
      const access_token = localStorage.getItem('access_token');
      const fetchData = async () => {
        const response = await FetchUserGifs(access_token);
        if (response.data) {
          setGifs(response.data);
        }
      };
      fetchData();
      }, [designChanges]);
      const handleDownloadLibraryGifs = async () => {
        if (!gifs) {
          return;
        }
        const gifData = gifs.data.map(gif => ({ url: gif.url, name: gif.name }));
        setLoading(true);
        try {
          const response = await DownloadAllLibraryGifs(gifData);
          // Create blob
          const blob = new Blob([response.data], { type: 'application/zip' });
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
        setLoading(false);
      };
      const shareGif = (gifUrl, resourceId) => {
        console.log('Sharing GIF:', gifUrl);
        console.log('Resource ID:', resourceId);
        setIsDesignOpen(true);
        setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId});
      };
      const handleShareButtonClick = () => {
        if (selectedGif !== null) {
          const hoveredGif = gifs.data[selectedGif];
          shareGif(hoveredGif.url, hoveredGif.resourceId);
          setDesignChanges(false);
        }
      };
      console.log('gifs', gifs);
      const handleOpenDesign = () => {
        setIsDesignOpen(true);
      };
    
      const handleCloseDesign = () => {
        setIsDesignOpen(false);
      };
  return (
    <div className="gif-library">
      <Header menu />
      <DesignGifDialog
        isOpen={isDesignOpen}
        selectedGif={selectedDesignGif}
        setDesignChanges={setDesignChanges}
        tabs={tabs}
        changeTab={changeTab}
        activeTab={activeTab}
        onClickOk={() => {
          handleOpenDesign();
        }}
        onClickCancel={() => {
          handleCloseDesign();
        }}
      />
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
                    <img src={item.url} alt="" style={{ border: `4px solid ${item.selectedColor}`}} />
                    <Box className="gif-buttons">
                      <Button className="download">Download</Button>
                      <Button className="share" onClick={handleShareButtonClick}>Edit</Button>
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
