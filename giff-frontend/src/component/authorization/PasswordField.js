import React from 'react';
import PropTypes from 'prop-types';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    fill: 'rgba(0, 0, 0, 0.2)',
  },
});

const PasswordField = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { name, onChange, placeholder, error, helperText } = props;
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
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <InputAdornment>
            <IconButton tabIndex="-1" size="small" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <VisibilityIcon fontSize="small" className={classes.root} />
              ) : (
                <VisibilityOffIcon fontSize="small" className={classes.root} />
              )}
            </IconButton>
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
