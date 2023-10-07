import React, { useEffect, useRef, useState } from 'react';
import './GiftForSale.scss';
import Header from './Header';
import { Box } from '@mui/material';
import ContentSeo from './ContentSeo';
import { marketingArticles, salesArticles } from '../articles/ArticlesData';
import ScrollDown from './ScrollDown';
import Tabs, { useTabs } from './Tabs';

const freeContentSeo = [
    {title: 'Why your sales outreach won’t convert'}, 
    {title: 'Cold outreach is hard - it doesn’t have to be'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'},
    {title: '5 tips to make your sales sequence succeed'}
]

function Articles() {
const targetRef = useRef(null);
const [scrolledUp, setScrolledUp] = useState(false);
const [showContent, setShowContent] = useState(false);
const { tabs, changeTab, activeTab } = useTabs(['Gift for sale', 'Gift for marketing', 'Giftspiration' ]);

function handleOnChangeTab(value) {
    changeTab(value);
}

const giftForTypes = [
{title: 'What is Gif-t?', description: <span>
    Gif-t for sales is all about using our gif-machine (aka the Gif-ter) to create a conversion-machine. It’s a simple way to make your <span>sales outreach</span> way, way more successful. Why? Well, do know how many sales pitches your leads get every day? It’s probably a ton and it makes it super hard to get through and be noticed. Even worse, it means that your audience may be wary of clicking links in emails and texts.<br></br><br></br>

    Gif-t gives you a way to pop, really. It increases the chance that your lead actually sees you and your offering. It makes it possible to stand out in a sea of boring text-based emails and messages. It boosts the chance that your lead will look at the material you share. It increases the odds that your lead will click to view whatever you want them to view etc.<br></br><br></br>

    Simply create a gif from the thing you want to share in your email, like a web page, a whitepaper or a sales presentation. Then,  Share directly via  email/ sms or download to share elsewhere.  
</span>},
{title: 'Gift for marketing', description: <span>
Gif-t for Marketing is all about improving your <span>email & SMS marketing.</span>  It’s all about using our gif-machine (aka the Gif-ter) to create a conversion-machine. It’s a simple way to get your audience to see you, raise their interest and drive them where you want them to go.<br></br><br></br>

Why? Well, do know how many emails your audience get every day, or how many nurture flows they have signed up for in their days?  It’s probably a ton. It’s probably a ton and it makes it super hard to get through to them. Even worse, it means that your audience may be wary of clicking things in emails and text messages.<br></br><br></br>

Gif-t gives you a way to fix it. It increases the chance that your audience stops to read - and actually sees you and your offering. It makes it feel more safe to click whatever link/material you want to share etc.<br></br><br></br>

Simply create a gif from the thing you want to share in your email, like a web page, a whitepaper or a blog post. Then,  add the gif directly to an email (or sms) and do what you always do.
</span>},
{title: 'Giftspiration', description: <span>
Wanna see how your gif can look? Scroll to see some cool examples of how gif-t takes a page and creates the perfect gif from it.
</span>},
]

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

function articleType() {
    return activeTab === 1 ? marketingArticles : salesArticles;
}

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
            <Header menu />
            <Box className="gift-for-sale-info">
                <Tabs
                    tabs={tabs}
                    onChange={handleOnChangeTab}
                    variant="tabs-level-2"
                />
                <Box>
                    <div className="title">{giftForTypes[activeTab].title}</div>
                    {giftForTypes[activeTab].description}
                </Box>
                <ScrollDown onClick={handleClick} />
            </Box>
        </div>
        {showContent && (
            <div className="gift-for-sale-content">
                <ContentSeo title="Free Sales Content" data={freeContentSeo} ref={targetRef} articles={articleType()} />
            </div>
        )}
    </>
  );
}

export default Articles;
