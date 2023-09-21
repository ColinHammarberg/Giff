import React, { useEffect, useRef, useState } from 'react';
import './GiftForMarketing.scss';
import Header from './Header';
import { Box } from '@mui/material';
import Spinner from './Spinner';
import ContentSeo from './ContentSeo';
import { marketingArticles } from '../articles/ArticlesData';

const freeContentSeo = [
    {title: 'Why is my email marketing not converting?'}, 
    {title: 'How to get newsletter subscribers to engage with content'},
    {title: '3 tips to drive traffic with killer emails'},
    {title: '3 tips to drive traffic with killer emails'},
    {title: '3 tips to drive traffic with killer emails'},
    {title: '3 tips to drive traffic with killer emails'}
]

function GiftForMarketing() {
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
        <div className="gift-for-marketing">
            <Header generator />
            <Box className="gift-for-marketing-info">
                <Box>
                    <div className="title">Gif-t for marketing</div>
                    <span>
                        Gif-t for Marketing is all about improving your <span>email & SMS marketing.</span>  It’s all about using our gif-machine (aka the Gif-ter) to create a conversion-machine. It’s a simple way to get your audience to see you, raise their interest and drive them where you want them to go.<br></br><br></br>

                        Why? Well, do know how many emails your audience get every day, or how many nurture flows they have signed up for in their days?  It’s probably a ton. It’s probably a ton and it makes it super hard to get through to them. Even worse, it means that your audience may be wary of clicking things in emails and text messages.<br></br><br></br>

                        Gif-t gives you a way to fix it. It increases the chance that your audience stops to read - and actually sees you and your offering. It makes it feel more safe to click whatever link/material you want to share etc.<br></br><br></br>

                        Simply create a gif from the thing you want to share in your email, like a web page, a whitepaper or a blog post. Then,  add the gif directly to an email (or sms) and do what you always do.
                    </span>
                </Box>
                <Box className="spinner-box">
                    <Spinner onClick={handleClick} title="Content" />
                </Box>
            </Box>
        </div>
        {showContent && (
            <div className="gift-for-sale-content">
                <ContentSeo data={freeContentSeo} articles={marketingArticles} ref={targetRef} />
            </div>
        )}
    </>
  );
}

export default GiftForMarketing;
