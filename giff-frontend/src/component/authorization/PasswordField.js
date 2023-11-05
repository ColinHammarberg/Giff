import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import EyeIcon from '../../resources/eye.png'
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    width: '20px',
  },
  hiddenPassword: {
    width: '20px',
    opacity: '0.4'
  }
});

const PasswordField = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { name, onChange, placeholder, error, helperText, onKeyPress, isShow } = props;
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <TextField
      ref={ref}
      autoComplete="off"
      type={showPassword ? 'text' : 'password'}
      required
      name={name}
      error={error}
      helperText={helperText}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <InputAdornment>
          {!isShow && (
            <IconButton tabIndex="-1" size="small" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <img src={EyeIcon} className={classes.root} alt="" />
              ) : (
                <img src={EyeIcon} className={classes.hiddenPassword} alt="" />
              )}
            </IconButton>
          )}
          </InputAdornment>
        ),
      }}
    />
  );
});

PasswordField.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default PasswordField;
