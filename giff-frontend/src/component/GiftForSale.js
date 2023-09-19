import React, { useEffect, useRef, useState } from 'react';
import './GiftForSale.scss';
import Header from './Header';
import { Box } from '@mui/material';
import Spinner from './Spinner';
import ContentSeo from './ContentSeo';
import { salesArticles } from '../articles/ArticlesData';

const freeContentSeo = [
    {title: 'Why your sales outreach won’t convert'}, 
    {title: 'Cold outreach is hard - it doesn’t have to be'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'}
]

function GiftForSale() {
const targetRef = useRef(null);
const [scrolledUp, setScrolledUp] = useState(false);
const [showContent, setShowContent] = useState(true);
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
        <div className="gift-for-sale">
            <Header generator />
            <Box className="gift-for-sale-info">
                <Box>
                    <div className="title">What is Gif-t?</div>
                    <span>
                        Gif-t for sales is all about using our gif-machine (aka the Gif-ter) to create a conversion-machine. It’s a simple way to make your <span>sales outreach</span> way, way more successful. Why? Well, do know how many sales pitches your leads get every day? It’s probably a ton and it makes it super hard to get through and be noticed. Even worse, it means that your audience may be wary of clicking links in emails and texts.<br></br><br></br>

                        Gif-t gives you a way to pop, really. It increases the chance that your lead actually sees you and your offering. It makes it possible to stand out in a sea of boring text-based emails and messages. It boosts the chance that your lead will look at the material you share. It increases the odds that your lead will click to view whatever you want them to view etc.<br></br><br></br>

                        Simply create a gif from the thing you want to share in your email, like a web page, a whitepaper or a sales presentation. Then,  Share directly via  email/ sms or download to share elsewhere.  
                    </span>
                </Box>
                <Spinner onClick={handleClick} title="Content" />
            </Box>
        </div>
        {showContent && (
            <div className="gift-for-sale-content">
                <ContentSeo data={freeContentSeo} ref={targetRef} articles={salesArticles} />
            </div>
        )}
    </>
  );
}

export default GiftForSale;
