import React from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './ArticleShowcase.scss';

const ArticleShowcase = ({ article, onClose, open }) => {
  function renderTitle() {
    return (
      <div className="responsive-dialog-title">
        {article?.title}
      </div>
    );
  }

  function renderContent() {
    return article?.content.map((part, index) => (
      <div key={index}>
        <strong>{part.titlePart}</strong>
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
      <DialogContent className="dialog-content styled-scrollbar">
        <IconButton
          className="close-button"
          color="secondary"
          onClick={onClose}
        >
          <CloseIcon className="close-icon" />
        </IconButton>
        <Box className="article-header">
          <Box className="left">
            <img src={article?.photo} alt="" />
          </Box>
          <Box className="right">
            <div>
              {renderTitle()}
            </div>
          </Box>
        </Box>
        <Box className="article-content">
          <h1>{article?.title}</h1>
          {renderContent()}
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
