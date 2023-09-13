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
          {this.props.infoButtonText.map((item) => {
            return (
              <div>
                {item.text}
                <br></br>
                <br></br>
              </div>
            )
          })}
        </div>
      </Popover>
    );
  }
}


export default InfoDialog;
