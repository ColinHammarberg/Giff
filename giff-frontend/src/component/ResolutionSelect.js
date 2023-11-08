import React, { useEffect } from 'react';
import { Autocomplete, IconButton, InputAdornment, TextField } from "@mui/material"
import { useState } from "react";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './ResolutionSelect.scss';

const ResolutionOptions = [
    { id: 9, value:  '100x100' },
    { id: 10, value: '200x200' },
    { id: 11, value: '300x300' },
    { id: 12, value: '400x400' },
    { id: 13, value: '500x500' },
    { id: 14, value: '600x600' },
    { id: 15, value: '700x700' },
    { id: 16, value: '800x800' },
    { id: 18, value: '1000x1000' },
    { id: 24, value: '1280x1000' },
]

function ResolutionSelect({ defaultValue, onChange }) {
    const findDefaultOption = () => ResolutionOptions.find(option => option.value === defaultValue);
    const [value, setValue] = useState(findDefaultOption());
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        setValue(findDefaultOption());
    }, [defaultValue]);

    function handleOnChange(event, newValue) {
        setValue(newValue);
        if (onChange && newValue) {
            onChange(newValue ? newValue.value : null);
        }
    }
    function handleClickShowOptions() {
        setShowOptions(!showOptions);
    }

    function handleOpenOptions() {
        setShowOptions(true);
    }
    function handleCloseOptions() {
        setShowOptions(false);
    }
    return (
        <Autocomplete
            open={showOptions}
            onOpen={handleOpenOptions}
            onClose={handleCloseOptions}
            options={ResolutionOptions}
            onChange={handleOnChange}
            value={value}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            getOptionLabel={(option) => option.value}
            className="resolution-size-select-autocomplete"
            renderInput={(params) => (
                <TextField
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...params}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <InputAdornment position="end">
                        <IconButton
                            aria-label="toggle password visibility"
                            size="small"
                            onClick={handleClickShowOptions}
                            className="icon-button"
                        >
                            {showOptions ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                        </IconButton>
                        </InputAdornment>
                    ),
                    }}
                />
            )}
        />
    );
}

export default ResolutionSelect;