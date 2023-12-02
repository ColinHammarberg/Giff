import React, { PureComponent } from 'react';
import { Box, Button, Popover } from '@mui/material';
import './MenuPopOver.scss';
import { getMenuItems, isAuthenticated } from '../../utils/utils';

class MenuPopOver extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: isAuthenticated(),
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleNavigationClick = this.handleNavigationClick.bind(this);
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

  handleNavigationClick(item) {
    if (item?.onClick) {
      item.onClick()
    } else {
      this.props.handleNavigation(item.url, item.isExternal)
    }
  }

  render() {
    const { anchorEl } = this.props;
    const menuItems = getMenuItems(this.state.isAuthenticated, this.props.handleOnClickSignIn, this.props.handleOnClickSignOut);
    if (!anchorEl) {
        return null;
    }
    return (
      <Popover
        open
        anchorOrigin={this.anchorOrigin}
        transformOrigin={this.transformOrigin}
        className="menu-popover"
        anchorEl={anchorEl}
        onClose={this.handleClose}
      >
        <Box className="gif-menu-items">
            {menuItems.map((item) => (
              item.isShow && (
                <Box key={item.key} onClick={() => this.handleNavigationClick(item)}>
                  {item.title}
                </Box>
              )
            ))}
        </Box>
        <Button onClick={this.handleClose} className="close-menu">CLOSE MENU</Button>
      </Popover>
    );
  }
}


export default MenuPopOver;
