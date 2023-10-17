/* eslint react/jsx-props-no-spreading: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import './DialogWrapper.scss';

function DialogWrapper(props) {
  const {
    open,
    onClose,
    children,
    actions,
    modal,
    maxWidth,
    showCloseIcon,
    disableEscapeKeyDown,
  } = props;

  function renderTitle() {
    if (!props.title) return null;
    if (React.isValidElement(props.title)) {
      return <>{props.title}</>;
    }
    return <span className="responsive-dialog-title">{props.title}</span>;
  }

  return (
    <Dialog
      className={`dialog-wrapper ${props.className}`}
      open={open}
      onClose={modal ? null : onClose}
      maxWidth={maxWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      transitionDuration={400}
    >
      <DialogContent className="dialog-content styled-scrollbar">
        {renderTitle()}
        {onClose && showCloseIcon ? (
          <Button
            className="close-button"
            onClick={onClose}
          >
            Close
          </Button>
        ) : null}

        {children}
      </DialogContent>
      {actions !== null && <DialogActions className="dialog-actions">{actions}</DialogActions>}
    </Dialog>
  );
}

DialogWrapper.propTypes = {
  modal: PropTypes.bool,
  open: PropTypes.bool,
  className: PropTypes.string,
  maxWidth: PropTypes.string,
  children: PropTypes.instanceOf(Object),
  actions: PropTypes.instanceOf(Object),
  onClose: PropTypes.func,
  title: PropTypes.node,
  showCloseIcon: PropTypes.bool,
  dataIds: PropTypes.instanceOf(Object),
  disableEscapeKeyDown: PropTypes.bool,
};

DialogWrapper.defaultProps = {
  modal: false,
  actions: null,
  className: '',
  maxWidth: 'sm',
  CloseIconProps: {},
  onClose: null,
  showCloseIcon: true,
  disableEscapeKeyDown: false,
  open: true,
};

export default DialogWrapper;
