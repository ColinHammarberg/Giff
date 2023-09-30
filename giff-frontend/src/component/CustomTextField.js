import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel, TextField } from '@mui/material';
import './CustomTextField.scss';

function CustomTextField(props) {
  const { name, onChange, placeholder, label, value } = props;
  return (
    <>
        <InputLabel>
            {label}
        </InputLabel>
        <TextField
            autoComplete="off"
            required
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </>
  );
};

CustomTextField.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default CustomTextField;
