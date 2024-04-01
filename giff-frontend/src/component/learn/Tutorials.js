import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './Tutorials.scss';
import DialogWrapper from '../DialogWrapper';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OutlookFirstStep from '../../resources/outlook.jpeg';
import OutlookSecondStep from '../../resources/Use_outlook.jpeg';
import GmailFirstStep from '../../resources/googleaddon.jpeg';
import MicrosoftLogo from '../../resources/Microsoft_logo.png';
import GoogleLogo from '../../resources/Gmail_Logo.png';
import EmailClientPopover from './EmailClientPopover';

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

  getStepsBasedOnEmailProvider = (emailProvider) => {
    let steps = [
      'https://player.vimeo.com/video/929117565?badge=0&autopause=0&player_id=0&app_id=58479',
    ];

    if (emailProvider === 'Outlook') {
      steps.push(
        'https://player.vimeo.com/video/929104892?badge=0&autopause=0&player_id=0&app_id=58479',
        'https://player.vimeo.com/video/929104845?badge=0&autopause=0&player_id=0&app_id=58479'
      );
    } else if (emailProvider === 'Gmail') {
      steps.push(
        'https://player.vimeo.com/video/929105019?badge=0&autopause=0&player_id=0&app_id=58479',
        'https://player.vimeo.com/video/929116900?badge=0&autopause=0&player_id=0&app_id=58479'
      );
    }

    return steps;
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      currentStepIndex: 0,
      steps: this.getStepsBasedOnEmailProvider(),
      showEmailClientPopover: false,
      anchorEl: null,
    };
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleCancel);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  handleNavigateNextStep = (event) => {
    if (this.state.currentStepIndex === 0) {
      this.setState({ anchorEl: event.target });
      this.setState({ showEmailClientPopover: true });
      return;
    }
    if (this.state.currentStepIndex === 2) {
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

  handleSelectEmailClient = (client) => {
    const newSteps = this.getStepsBasedOnEmailProvider(client);

    this.setState({
      steps: newSteps,
      currentStepIndex: 1,
      showEmailClientPopover: false,
    });
  };

  render() {
    const { isOpen, isMobile } = this.props;
    const { currentStepIndex, anchorEl } = this.state;
    const showOutlookButton =
      this.state.steps[currentStepIndex] === OutlookFirstStep ||
      this.state.steps[currentStepIndex] === OutlookSecondStep;

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
            <iframe
              src={this.state.steps[this.state.currentStepIndex]}
              width="640"
              height="360"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              title="Tutorials"
              allowfullscreen
            ></iframe>
          </div>
          <EmailClientPopover
            open={this.state.showEmailClientPopover}
            onClose={() => this.setState({ showEmailClientPopover: false })}
            anchorEl={anchorEl}
            onSelectGoogle={() => this.handleSelectEmailClient('Gmail')}
            onSelectOutlook={() => this.handleSelectEmailClient('Outlook')}
          />
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
