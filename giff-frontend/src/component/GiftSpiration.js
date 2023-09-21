import React, { useEffect, useRef, useState } from 'react';
import './GiftSpiration.scss';
import Header from './Header';
import { Box } from '@mui/material';
import ContentSeo from './ContentSeo';
import ScrollDown from './ScrollDown';

const freeContentSeo = [
    {title: 'Sales presentation gif'}, 
    {title: 'Blog post gif'},
    {title: 'Product GIF'},
    {title: 'Product GIF'},
    {title: 'Product GIF'},
    {title: 'Product GIF'}
]

function GiftSpiration() {
const targetRef = useRef(null);
const [scrolledUp, setScrolledUp] = useState(false);
const [showContent, setShowContent] = useState(false);
useEffect(() => {
    const handleScroll = () => {
        setScrolledUp(window.scrollY);
        if (scrolledUp === 0) {
            setShowContent(false);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}, [scrolledUp, setShowContent]);

const handleClick = async () => {
    await setShowContent(true);
    setScrolledUp(false);
    if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: 'smooth' });
    }
};
  return (
    <>
        <div className="gift-spiration">
            <Header generator />
            <Box className="gift-spiration-info">
                <Box>
                    <div className="title">Gif-spiration</div>
                    <span>
                        Wanna see how your gif can look? Scroll to see some cool examples of how gif-t takes a page and creates the perfect gif from it.
                    </span>
                </Box>
                <ScrollDown onClick={handleClick} />
            </Box>
        </div>
        {showContent && (
            <div className="gift-spiration-content">
                <ContentSeo title="Gif-spiration and how-tos" data={freeContentSeo} ref={targetRef} />
            </div>
        )}
    </>
  );
}

export default GiftSpiration;
