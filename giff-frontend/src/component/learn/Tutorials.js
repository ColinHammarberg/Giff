import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './Tutorials.scss';
import DialogWrapper from '../DialogWrapper';
import { Button } from '@mui/material';
// Import your step GIFs here
import CloseIcon from '@mui/icons-material/Close';
import FirstStep from '../../resources/firststep.jpeg';
import OutlookFirstStep from '../../resources/outlook.jpeg';
import GmailFirstStep from '../../resources/googleaddon.jpeg';

const steps = [FirstStep, OutlookFirstStep, GmailFirstStep];

class Tutorials extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      currentStepIndex: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleCancel);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  handleNavigateNextStep = () => {
    if (this.state.currentStepIndex === 2) {
      this.props.setDisplayTutorial(false);
    }
    this.setState(prevState => ({
      currentStepIndex: (prevState.currentStepIndex + 1) % steps.length,
    }));
  };

  handleNavigatePrevStep = () => {
    this.setState(prevState => ({
      currentStepIndex: prevState.currentStepIndex === 0 ? steps.length - 1 : prevState.currentStepIndex - 1,
    }));
  };

  render() {
    const { isOpen, isMobile } = this.props;
    const { currentStepIndex } = this.state;

    console.log('currentStepIndex', currentStepIndex);

    return (
      <DialogWrapper
        modal
        maxWidth="lg"
        className={`white new-popup tutorials ${isMobile ? 'mobile-view' : ''}`}
        onClose={this.handleCancel}
        open={isOpen}
      >
        <div className="background" />
        <div className="content">
          <div className="header">
            <div className="branding">GIF-T</div>
            <div className="close" onClick={() => this.props.setDisplayTutorial(false)}>
              <CloseIcon />
            </div>
          </div>
          <div className="showcase">
            <img src={steps[currentStepIndex]} alt={`Step ${currentStepIndex + 1}`} />
          </div>
          <div className="bottom-actions">
            <Button onClick={this.handleNavigatePrevStep} className="prev-btn">Prev</Button>
            <Button onClick={this.handleNavigateNextStep} className="next-btn">Next</Button>
          </div>
        </div>
      </DialogWrapper>
    );
  }
}

Tutorials.propTypes = {
  isOpen: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickCancel: PropTypes.func,
  isPublicSpace: PropTypes.bool,
  selectedGif: PropTypes.object,
  isMobile: PropTypes.bool,
};

export default Tutorials;
