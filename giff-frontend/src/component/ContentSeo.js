import React, { forwardRef } from 'react';
import './ContentSeo.scss';
import { Box } from '@mui/material';

const ContentSeo = forwardRef((props, ref) => {
  return (
    <div ref={ref} className="content-seo">
      <div>{props.title}</div>
      {props.data.map((item) => {
        return (
            <div className="box-container">
                <Box className="content-boxes">
                  <div className="title">
                      {item.title}
                  </div>
                </Box>
            </div>
        )
      })}
    </div>
  );
});

export default ContentSeo;
