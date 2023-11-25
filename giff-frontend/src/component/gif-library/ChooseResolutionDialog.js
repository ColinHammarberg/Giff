import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './ChooseResolutionDialog.scss';
import { showNotification } from '../notification/Notification';
import { SaveUserResolution } from '../../endpoints/UserEndpoints';

let resolve;
let containerElement;

class ChooseResolutionDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasConfirmed: false,
      selectedResolution: '',
      savedSettings: '',
      isSavingSettings: false,
      shouldSaveSettings: false,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleHistoryStateChanged = this.handleHistoryStateChanged.bind(this);
    this.handleSaveSettingsChange = this.handleSaveSettingsChange.bind(this);
    this.toggleSaveSettings = this.toggleSaveSettings.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleHistoryStateChanged);
    // Retrieve and set saved settings
    const savedSettings = localStorage.getItem('selectedResolution');
    if (savedSettings) {
      this.setState({ selectedResolution: savedSettings, savedSettings });
    }
  }

  toggleSaveSettings() {
    this.setState(prevState => ({
      shouldSaveSettings: !prevState.shouldSaveSettings
    }), () => {
      if (this.state.shouldSaveSettings) {
        this.handleSaveSettingsChange();
      }
    });
  }

  async handleSaveSettingsChange() {
    this.setState({ isSavingSettings: true });
    try {
      const response = await SaveUserResolution(this.state.selectedResolution);
      console.log('Settings saved:', response);
      this.setState({
        savedSettings: this.state.selectedResolution,
        isSavingSettings: false
      });
      showNotification('success', 'Successfully saved settings.')
    } catch (error) {
      console.error('Error saving settings:', error);
      this.setState({
        savedSettings: '',
        isSavingSettings: false
      });
      showNotification('error', 'Error while saving settings.')
    }
  }
  

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleHistoryStateChanged);
    resolve = null;
    containerElement = null;
  }

  static show() {
    containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    return new Promise((res) => {
      resolve = res;
      ReactDOM.render(
        <ThemeProvider theme={createTheme()}>
          <ChooseResolutionDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        ChooseResolutionDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false,  }, () => {
        ChooseResolutionDialog.destroy();
    });
  }

  handleRadioButtonChange(option) {
    this.setState({ selectedResolution: option.value });
    this.setState({ savedSettings: '' });
  }

  handleConfirm() {
    if (this.state.shouldSaveSettings) {
      this.handleSaveSettingsChange(); // Only save settings if checkbox is checked
    }
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
      ChooseResolutionDialog.destroy({
        hasConfirmed: this.state.hasConfirmed,
        selectedResolution: this.state.selectedResolution,
      });
    });
  }

  handleClose = () => {
    this.setState({ isOpen: false }, () => {
      ChooseResolutionDialog.destroy();
    });
  };

  static destroy(retVal = false) {
    if (containerElement) {
      document.body.removeChild(containerElement);
    }
    if (typeof resolve === 'function') {
      resolve(retVal);
    }
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }
    const options = [
        { value: '1280x1000', desc: 'Large', id: '1' },
        { value: '1000x1000', desc: 'Medium-Large', id: '2' },
        { value: '800x800', desc: 'Medium', id: '3' },
        { value: '400x400', desc: 'Small', id: '4' },
        { value: '200x200', desc: 'X-Small', id: '5' },
        { value: '100x100', desc: 'Ultra-Small', id: '6' },
    ]
    return (
        <Dialog
            className="choose-resolution-dialog"
            open={true}
            fullScreen={null}
            maxWidth={'sm'}
            transitionDuration={400}
            onClose={this.handleClose}
        >
          <DialogContent className="dialog-content styled-scrollbar">
            <Box className="choose-resolution-options">
                <Box className="option-header">
                  Choose your size
                </Box>
                <Box className="content">
                  <Box className="options">
                      {options.map((option) => {
                          return (
                            <span id={option.id} className="value">
                              <input 
                                type="radio" 
                                name="resolution" 
                                onChange={() => this.handleRadioButtonChange(option)} 
                                checked={this.state.selectedResolution === option.value}
                              />
                              {`${option.value}PX (AKA ${option.desc})`}
                            </span>
                          )
                      })}
                  </Box>
                  <Box className="option-actions">
                      <Button onClick={this.handleConfirm} disabled={!this.state.selectedResolution}>Download</Button>
                        <span>Save settings 
                          <input 
                            type="checkbox"
                            name="save_settings" 
                            onChange={() => this.setState({ shouldSaveSettings: !this.state.shouldSaveSettings })} 
                            checked={this.state.shouldSaveSettings}
                          />
                        </span>
                  </Box>
              </Box>
            </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

ChooseResolutionDialog.propTypes = {
  
};

export default ChooseResolutionDialog;

