import React, { forwardRef, useState } from 'react';
import './ContentSeo.scss';
import { Box, Button } from '@mui/material';
import ArticleShowcase from './ArticleShowcase';

const ContentSeo = forwardRef((props, ref) => {
  const [article, setArticle] = useState(null);

  function handleOnClickArticle(index) {
    setArticle(props.articles[index]);
  }

  function handleOnClose() {
    setArticle(null);
  }
  return (
      <div ref={ref} className="content-seo">
        <div className="title">{props.title}</div>
        <div className="content-map">
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
        {article && (
          <ArticleShowcase article={article} onClose={handleOnClose} />
        )}
      </div>
  );
});

export default ContentSeo;
