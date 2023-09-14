import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './EmailChoice.scss';

function EmailChoice() {
    const navigate = useNavigate();
    const [checked, setChecked] = React.useState(false);

    // Load the saved choice from localStorage on component mount
    useEffect(() => {
        const savedChoice = localStorage.getItem('emailChoice');
        if (savedChoice === 'create-one' || savedChoice === 'create-several') {
            setChecked(true);
        }
    }, []);

    const handleButtonChoice = (choice) => {
        // Save the choice in localStorage when the button is clicked
        localStorage.setItem('emailChoice', choice);
        navigate(choice === 'create-one' ? '/single-gif-creation' : '/multiple-gif-creation');
    };

    const handleChange = (event) => {
        const newValue = event.target.checked;
        setChecked(newValue);

        // Clear the saved choice in localStorage when the checkbox is unchecked
        if (!newValue) {
            localStorage.removeItem('emailChoice');
        }
    };

    return (
        <>
            <div className="choose-option-create">
                <Header generator />
                <Box className="choose-email-choice-info">
                    <Box className="container">
                        <div className="sub-title">
                            How do you want to send your email?
                        </div>
                    </Box>
                    <Box className="choose-btns">
                        <Button className="create-one" onClick={() => handleButtonChoice('create-one')}>
                            Use my own email to send gif
                        </Button>
                        <Button className="create-several" onClick={() => handleButtonChoice('create-several')}>
                            Send gif directly from Gif-t
                        </Button>
                    </Box>
                    <Box className="save-my-choice">
                        Save my choice for next time <Checkbox onChange={handleChange} checked={checked} inputProps={{ 'aria-label': 'controlled' }} />
                    </Box>
                </Box>
            </div>
        </>
    );
}

export default EmailChoice;
