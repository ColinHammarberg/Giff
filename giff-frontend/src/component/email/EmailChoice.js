import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '../overall/Header';
import './EmailChoice.scss';
import InfoButton from '../overall/InfoButton';

const infoButtonText = [
    {text: 'Our AI can help you write the perfect email to go with your new gif. It’s powered by Open AI. It can also give some faulty advice and information, so don’t rely completely on it. Use common sense and verify things, you know?'},
]

function EmailChoice() {
    const navigate = useNavigate();
    const [checked, setChecked] = React.useState(false);
    const [openAiChoice, setOpenAiChoice] = React.useState(false);

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
        navigate(choice === 'create-one' ? '/send-own-email' : '/send-gift-email');
    };

    const handleChange = (event) => {
        const newValue = event.target.checked;
        setChecked(newValue);

        // Clear the saved choice in localStorage when the checkbox is unchecked
        if (!newValue) {
            localStorage.removeItem('emailChoice');
        }
    };

    function OpenAiChoice() {
        return (
            <>
                <Box className="container">
                    <div className="sub-title ai">
                        Do you want to use AI to help you write the email? <InfoButton infoButtonText={infoButtonText} />
                    </div>
                </Box>
                <Box className="choose-btns">
                    <Button className="create-one" onClick={() => navigate('/mrs-gift')}>
                        YES, I want to use AI
                    </Button>
                    <Button className="create-several" onClick={() => navigate('/send-via-own-email')}>
                        No, I dont want to use AI
                    </Button>
                </Box>
            </>
        )
    }

    return (
        <>
            <div className="choose-option-create">
                <Header generator />
                <Box className="choose-email-choice-info">
                {!openAiChoice ? (
                    <>
                        <Box className="container">
                        <div className="sub-title">
                            How do you want to send your email?
                        </div>
                        </Box>
                        <Box className="choose-btns">
                        <Button className="create-one" onClick={() => setOpenAiChoice(true)}>
                            Use my own email to send gif
                        </Button>
                        <Button className="create-several" onClick={() => handleButtonChoice('create-several')}>
                            Send gif directly from Gif-t
                        </Button>
                        </Box>
                        <Box className="save-my-choice">
                        Save my choice for next time{' '}
                        <Checkbox onChange={handleChange} checked={checked} inputProps={{ 'aria-label': 'controlled' }} />
                        </Box>
                    </>
                    ) : (
                        OpenAiChoice()
                )}

                    
                </Box>
            </div>
        </>
    );
}

export default EmailChoice;
