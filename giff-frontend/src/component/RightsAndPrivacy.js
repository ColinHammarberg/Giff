import React from 'react';
import './PrivacyPolicy.scss';
import Header from './Header';
import { Box } from '@mui/material';

function RightsAndPrivacy() {
  return (
    <div className="privacy-policy">
      <Header menu />
        <Box className="privacy-policy-info">
            <Box>
                <div className="title">Privacy</div>
                <span>
                    Don’t worry, We respect your privacy. We may use cookies to make it easier for you to use Gif-t, and may use analytics services to see where you, our users, are and what pages you look at. So we can see where gif-t is used the most, fix things if a button is badly made and you can’t see it etc. things like that.<br></br><br></br>
                    The gif you make will only be stored long enough for you to download or share it. we won’t keep it any longer, your gif is your gif and not ours.  
                </span>
            </Box>
            <Box>
                <div className="title">Your responsibility.</div>
                <span>
                    Speaking of, your gif is really your gif. We don’t take responsibility for how it’s used or what it shows, and its on you to make sure that you’re allowed to make and share a gif from the url you use - and that it shows what you want to share. Say after us: I will always check, before I share.
                </span>
            </Box>
            <Box>
                <div className="title">Our rights</div>
                <span>
                    We reserve the right to stop a gif to be made if we find it offensive. In other words,  keep it kind and nice. Imagine that your mother is watching. Or your dog. Or your boss.
                </span>
            </Box>
        </Box>
    </div>
  );
}

export default RightsAndPrivacy;
