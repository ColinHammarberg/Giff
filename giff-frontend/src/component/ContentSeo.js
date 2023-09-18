import React, { forwardRef } from 'react';
import './ContentSeo.scss';
import { Box, Button } from '@mui/material';

const ContentSeo = forwardRef((props, ref) => {
  function handleOnClickArticle(index) {
    return;
  }
  return (
    <div ref={ref} className="content-seo">
      <div>{props.title}</div>
      {props.data.map((item, index) => {
        return (
          <>
            <div className="box-container">
                <Box className="content-boxes">
                  <div className="title">
                      {item.title}
                  </div>
                </Box>
                <Button onClick={() => handleOnClickArticle(index)} className="article-btn">Click to read article</Button>
            </div>
            </>
        )
      })}
    </div>
  );
});

export default ContentSeo;
