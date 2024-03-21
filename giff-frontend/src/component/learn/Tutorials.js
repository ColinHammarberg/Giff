import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './Tutorials.scss';
import DialogWrapper from '../DialogWrapper';
import { Button } from '@mui/material';
// Import your step GIFs here
import CloseIcon from '@mui/icons-material/Close';
import FirstStep from '../../resources/firststep.jpeg';
import OutlookFirstStep from '../../resources/outlook.jpeg';
import OutlookSecondStep from '../../resources/Use_outlook.jpeg';
import GmailFirstStep from '../../resources/googleaddon.jpeg';
import MicrosoftLogo from '../../resources/Microsoft_logo.png';
import GoogleLogo from '../../resources/Gmail_Logo.png';

class Tutorials extends PureComponent {
  getEmailProvider = (email) => {
    if (!email) return 'Unknown';

    const domain = email.split('@')[1];
    switch (domain.toLowerCase()) {
      case 'gmail.com':
        return 'Google';
      case 'outlook.com':
      case 'hotmail.com':
        return 'Microsoft';
      default:
        return 'Other';
    }
  };

  getStepsBasedOnEmailProvider = () => {
    const steps = [FirstStep];
    const emailProvider = this.getEmailProvider(this.props.userEmail);

    if (emailProvider === 'Microsoft') {
      steps.push(OutlookFirstStep, OutlookSecondStep);
    } else if (emailProvider === 'Google') {
      steps.push(GmailFirstStep);
    } else {
      // Default case: Show both if the email doesn't match Gmail or Outlook
      steps.push(OutlookFirstStep, OutlookSecondStep, GmailFirstStep);
    }

    return steps;
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      currentStepIndex: 0,
      steps: this.getStepsBasedOnEmailProvider(),
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleCancel);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  handleNavigateNextStep = () => {
    if (this.state.currentStepIndex === 3) {
      this.props.setDisplayTutorial(false);
    }
    this.setState((prevState) => ({
      currentStepIndex:
        (prevState.currentStepIndex + 1) % this.state.steps.length,
    }));
  };

  handleNavigatePrevStep = () => {
    this.setState((prevState) => ({
      currentStepIndex:
        prevState.currentStepIndex === 0
          ? this.state.steps.length - 1
          : prevState.currentStepIndex - 1,
    }));
  };

  render() {
    const { isOpen, isMobile } = this.props;
    const { currentStepIndex } = this.state;
    const showOutlookButton =
      this.state.steps[this.state.currentStepIndex] === OutlookFirstStep ||
      this.state.steps[this.state.currentStepIndex] === OutlookSecondStep;

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
            <div
              className="close"
              onClick={() => this.props.setDisplayTutorial(false)}
            >
              <CloseIcon />
            </div>
          </div>
          <div className="showcase">
            <img
              src={this.state.steps[currentStepIndex]}
              alt={`Step ${currentStepIndex + 1}`}
            />
          </div>
          <div className="bottom-actions">
            {showOutlookButton && (
              <Button
                className="addon-btn"
                onClick={() =>
                  window.open(
                    'https://appsource.microsoft.com/en-us/product/office/WA200006594'
                  )
                }
              >
                <img src={MicrosoftLogo} alt="Microsoft logo" /> To Microsoft
              </Button>
            )}
            {this.state.steps[this.state.currentStepIndex] ===
              GmailFirstStep && (
              <Button
                className="addon-btn"
                onClick={() =>
                  window.open(
                    'https://workspace.google.com/marketplace/app/gift/537947018056?'
                  )
                }
              >
                <img src={GoogleLogo} alt="Google logo" /> To Google
              </Button>
            )}
            <Button onClick={this.handleNavigateNextStep} className="next-btn">
              Next Step
            </Button>
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
