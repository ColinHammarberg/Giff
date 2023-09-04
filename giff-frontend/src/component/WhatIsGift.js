import React from 'react';
import './WhatIsGift.scss';
import Header from './Header';
import { Box } from '@mui/material';

function WhatIsGift() {
  return (
    <div className="what-is-gift">
      <Header generator />
        <Box className="gift-info">
            <Box>
                <div className="title">What is Gif-t?</div>
                <span>Gif-t is a way to increase your Click-through rate in emails and texts. 
                    It lets you create a compressed and shareable gif from any public ,online web page or presentation - with one click. 
                    With that, you can share your page or presentation in a converting gif-format instead of an ordinary link.
                </span>
            </Box>
            <Box>
                <div className="title">How does Gif-t work?</div>
                <span>All you have to do is add a url. Our Gif-maker (AKA The GIf-ter) will scroll through the place your url leads to, make a recording and turn it into a gif that you can either download or share in an email or text message.</span>
            </Box>
            <Box>
                <div className="title">Why should I use Gif-t?</div>
                <span>Sales and marketing teams do a lot of outreach in email or text messages. their audience get more of these messages than ever before and don’t really like to click links. The consequence is a bad Click-through-rate (around 2.9 %) and sales and marketing efforts that perform way under their potential.  
                      Gif-t let you make the page or presentation you want to share into a shareable gif to include in your outreach. It hels you stand out in an inbox filled with boring text-based messages. It also makes your audience curious to click and view your material  - while making it feel safe to do so. . After all, your audience can now immediately see what you want to share with them. 
                      Oh, and before we forget: the gifs you make with Gif-t are already compressed and ready to send.  If you’ve evr tried to send a large file you may already know how much hassle that can save.
                </span>
            </Box>
        </Box>
    </div>
  );
}

export default WhatIsGift;
