import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './ArticleShowcase.scss';
import { useNavigate } from 'react-router-dom';

const ArticleShowcase = ({ article, onClose, open }) => {
  const navigate = useNavigate();

  function renderContent() {
    return article?.content.map((part, index) => (
      <div key={index}>
        <strong className={`header-${index}`}>{part.titlePart}</strong>
        <br />
        <p>{part.text}</p>
        <br /><br />
      </div>
    ));
  }

  return (
    <Dialog
      className={`responsive-dialog`}
      open={open}
      transitionDuration={400}
    >
      <div
          className="close-button"
          color="secondary"
          onClick={onClose}
        >
          Close
        </div>
      <DialogContent className="dialog-content styled-scrollbar">
        <Box className="article-header">
          <img src={article?.photo} alt="" />
        </Box>
        <Box className="article-content">
          <h1>{article?.title}</h1>
          {renderContent()}
        </Box>
        <Box className="article-btn">
          <Button className="create-btn" onClick={() => navigate('/single-gif-creation')}>Create your own gif now</Button>
          <Button className="read-more-btn">Read more marketing posts</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

ArticleShowcase.propTypes = {
  modal: PropTypes.bool,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

ArticleShowcase.defaultProps = {
  fullScreen: null,
  open: true,
};

export default ArticleShowcase;
