import React, { useEffect, useRef, useState } from 'react';
import './Articles.scss';
import Header from '../overall/Header';
import { Box } from '@mui/material';
import ContentSeo from './ContentSeo';
import { marketingArticles, salesArticles } from '../../articles/ArticlesData';
import ScrollDown from './ScrollDown';
import Tabs, { useTabs } from '../tabs/Tabs';

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
const { tabs, changeTab, activeTab } = useTabs(['What is gift?', 'Gift for marketing', 'Gift for sales' ]);

function handleOnChangeTab(value) {
    changeTab(value);
}

const giftForTypes = [
    {
      description: (
        <span>
          <h1>What is gif-t?</h1>
          <p>Gif-t is a way to quickly create a compressed and shareable gif from any public ,online web page or  presentation. With that, you can share an engaging preview of your page or content - or even hyperlink it to create the most smashing CTA ever.</p>
          <h1>How does Gif-t Work?</h1>
          <p>All you have to do is add a url. Our Gif-maker (AKA The GIf-ter) will scroll through the place your url leads to, make a recording and turn it into a gif that you can either download or share  in an email or text message.</p>
          <h1>Why should I use Gif-t?</h1>
          <p>You know how prospects and marketing contacts  don’t really click links in emails or messages? We fix that by giving you a way to create a converting gif from the page you want to share with them. So that you can give your prospect or marketing contact an engaging preview, <span className="what-is-gift">like a  movie trailer for your content.</span> Just like those thrilling trailers make people want to hit the theater (or, you know, a streaming service), your preview will make want to click and view your content.</p>
        </span>
      ),
    },
    {
      title: 'Gift for marketing',
      description: (
        <span>
          <p>Gif-t for Marketing is all about improving your <span className="marketing">email & SMS marketing.</span> It’s an easy and scaleable way to boost your click-through rate. After all, GIF-T allows you to create an engaging preview for the page or content you want to share. <span className="marketing">Kind of like a thrilling movie trailer, but for your marketing content.</span></p><br></br>
  
          <p>Speaking of marketing content. We’ve compiled a ton of it right here. Check it out to get new ideas and inspiration to take your marketing machine to the stratosphere.</p><br></br>
        
        </span>
      ),
    },
    {
      title: 'Gift for sales',
      description: (
        <span>
          <p>Gif-t for sales is all about improving your <span className="gift-for-sales">sales outreach.</span> It’s an easy and scaleable way to boost your click-through rate: After all, GIF-T allows you to create an engaging preview for the page or content you want to share. <span className="gift-for-sales">Kind of like a thrilling movie trailer, but for your sales content.</span></p>
          
          <p>Speaking of sales  content. We’ve compiled a ton of it right here. Scroll down to get new ideas and inspiration to take your sales machine to the stratosphere.</p>
        </span>
      ),
    },
  ];

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
    let articles = null;
    if (activeTab === 1) {
        articles = marketingArticles;
    } else if (activeTab === 2) {
        articles = salesArticles;
    }
    return articles;
}

function articleClassName() {
    let className = 'what-is-gift';
    if (activeTab === 1) {
        className = 'gift-for-marketing';
    } else if (activeTab === 2) {
        className = 'gift-for-sales';
    }
    return className;
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
        <div className="article-showcase">
            <Header menu />
            <Box className="gift-for-sale-info">
                <Tabs
                    tabs={tabs}
                    onChange={handleOnChangeTab}
                    variant="tabs-level-2"
                    className={articleClassName()}
                />
                <Box>
                    <div className={`title ${articleClassName()}`}>{giftForTypes[activeTab].title}</div>
                    {giftForTypes[activeTab].description}
                </Box>
                {articleType() && (
                  <ScrollDown onClick={handleClick} />
                )}
            </Box>
        </div>
        {showContent && (
            <div className="gift-for-sale-content">
                <ContentSeo title="Free Sales Content" data={freeContentSeo} ref={targetRef} className={articleClassName()} articles={articleType()} />
            </div>
        )}
    </>
  );
}

export default Articles;
