import React, { PureComponent } from 'react';
import { Popover } from '@mui/material';
import './InfoDialog.scss';

class InfoDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.anchorOrigin = {
      vertical: 'bottom',
      horizontal: 'left',
    };
    this.transformOrigin = {
      vertical: 'top',
      horizontal: 'left',
    };
  }

  handleClose() {
    this.props.onClosePopup();
  }

  render() {
    const { anchorEl } = this.props;
    if (!anchorEl) {
        return null;
    }
    return (
      <Popover
        open
        anchorOrigin={this.anchorOrigin}
        transformOrigin={this.transformOrigin}
        className="popover"
        anchorEl={anchorEl}
        onClose={this.handleClose}
      >
        <div className="content">
            With Gif-t, you can create a gif from an online pdf, web page or presentation. Simply add the url and click Create gif.<br></br><br></br>
            Our gif-machine (AKA the Gif-ter) will scroll through the place your url leads to, create a gif and make it ready for you to share.<br></br><br></br>
            Your url needs to lead somewhere scrollable (it can’t just be one page, like google.com), and it cannot be locked behind a login or verification (like a sharepoint or a pay-walled magazine). 
        </div>
      </Popover>
    );
  }
}


export default InfoDialog;
