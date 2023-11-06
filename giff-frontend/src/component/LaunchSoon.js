import React from 'react';
import './LaunchSoon.scss';
import LaunchSoonGif from '../resources/LaunchSoon.gif';

function LaunchSoon() {
  return (
    <div className="gif-landing">
        <div className="header-display">GIf-t. A movie trailer, but for your content.</div>
        <div>
            <img src={LaunchSoonGif} alt="" />
        </div>
        <div className="launch-text">Launching on 01/01. </div>
    </div>
  );
}

export default LaunchSoon;
