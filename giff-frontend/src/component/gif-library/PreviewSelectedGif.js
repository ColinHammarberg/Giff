import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@mui/icons-material/Download';
import IosShareIcon from '@mui/icons-material/IosShare';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import './PreviewSelectedGif.scss';
import DialogWrapper from '../DialogWrapper';
import Logo from '../../resources/logo-pinkpng.png';
import { IconButton } from '@mui/material';

class PreviewSelectedGif extends PureComponent {
  constructor(props) {
    super(props);
    this.gifImageRef = React.createRef();
    this.state = {
      isOpen: true,
      previewGif: this.props.previewGif,
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleCancel);
  }

  componentDidUpdate(prevProps) {
    console.log('###componentDidUpdate');
    this.setState({ previewGif: this.props.previewGif });
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  render() {
    const { previewGif } = this.state;
    const { isOpen, isMobile, setPreviewGif, handleOnDownload, handleEditGif } =
      this.props;

    return (
      <DialogWrapper
        modal
        maxWidth="lg"
        className={`white new-popup preview-selected-gif ${
          isMobile ? 'mobile-view' : ''
        }`}
        onClose={this.handleCancel}
        open={isOpen}
      >
        <div className="background">
          <img src={Logo} alt="" />
        </div>
        <div className="content">
          <div className="header">
            <div className="branding">GIF-T</div>
            <div className="name">{previewGif.name}</div>
            <div className="close" onClick={() => setPreviewGif({})}>
              <CloseIcon />
            </div>
          </div>
          <div className="showcase">
            <img src={previewGif.url} alt="" />
          </div>
          <div className="bottom-actions">
            <img src={Logo} alt="" />
            <div className="actions">
              {!isMobile && (
                <div className="type">
                  <IconButton onClick={handleEditGif}>
                    <EditIcon />
                  </IconButton>
                  <span>Edit</span>
                </div>
              )}
              <div className="type">
                <IconButton>
                  <IosShareIcon />
                </IconButton>
                <span>Share</span>
              </div>
              <div className="type">
                <IconButton onClick={handleOnDownload}>
                  <DownloadIcon />
                </IconButton>
                <span>Download</span>
              </div>
            </div>
          </div>
        </div>
      </DialogWrapper>
    );
  }
}

PreviewSelectedGif.propTypes = {
  isOpen: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickCancel: PropTypes.func,
  isPublicSpace: PropTypes.bool,
  selectedGif: PropTypes.object,
};

export default PreviewSelectedGif;
