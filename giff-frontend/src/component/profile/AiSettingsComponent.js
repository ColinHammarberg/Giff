import React, { useState } from 'react';
import './AiSettingsComponent.scss';
import { showNotification } from '../notification/Notification';
import {
  ToggleEmailAI,
  ToggleIncludeAI,
} from '../../endpoints/GifCreationEndpoints';
import { Box, Checkbox } from '@mui/material';

function AiSettingsComponent({ user, setChangeUserDetails, setActiveComponent }) {
  const [aiChecked, setAiChecked] = useState(user?.include_ai);
  const [aiEmailChecked, setAiEmailChecked] = useState(
    user?.include_example_email
  );
  // Store initial values to check for changes
//   const [initialValues, setInitialValues] = useState({
//     aiEmailChecked: user?.include_ai || '',
//     aiChecked: user?.include_example_email || '',
//   });

//   useEffect(() => {
//     setInitialValues({
//       aiEmailChecked: user?.include_ai || '',
//       aiChecked: user?.include_example_email || '',
//     });
//   }, [user]);

  const handleOnChangeAICheckbox = async (event) => {
    const newValue = event.target.checked;
    try {
      setAiChecked(newValue);

      const response = await ToggleIncludeAI();
      console.log('Settings saved:', response);

      if (response.data.status !== 'success') {
        setAiChecked(!newValue);
        showNotification(
          'error',
          'Ohh noo! There was an issue to add usage of AI to describe your gifs!'
        );
      } else {
        setChangeUserDetails(newValue);
        const successMessage = newValue
          ? "Wohooo champ! You've selected to use AI to describe your gifs!"
          : 'You have unselected the AI feature for describing your gifs.';
        showNotification('success', successMessage);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Revert the state in case of an error
      setAiChecked(!newValue);
      showNotification(
        'error',
        'Ohh noo! There was an issue to add usage of AI to describe your gifs!'
      );
    }
  };

  const handleOnChangeAIExampleEmailCheckbox = async (event) => {
    const newValue = event.target.checked;
    console.log('event', event.target.checked);

    try {
      setAiEmailChecked(newValue);

      const response = await ToggleEmailAI();
      console.log('Settings saved:', response);

      if (response.data.status !== 'success') {
        // Revert the state if the API call is not successful
        setAiEmailChecked(!newValue);
        showNotification(
          'error',
          'Ohh noo! There was an issue to activate AI mode!'
        );
      } else {
        // Show different messages based on newValue
        setChangeUserDetails(newValue);
        const successMessage = newValue
          ? "Wohooo champ! You've activated AI mode!"
          : 'You have unselected the AI mode!';
        showNotification('success', successMessage);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Revert the state in case of an error
      setAiEmailChecked(!newValue);
      showNotification(
        'error',
        'Ohh noo! There was an issue to activate AI mode!'
      );
    }
  };

  return (
    <div className="wrapper">
      <div
        className="title"
        style={{
          fontFamily: 'Staatliches',
          margin: 'auto',
          color: '#fff',
          fontSize: '30px',
          marginBottom: '30px',
        }}
      >
        {' '}
        AI Settings
      </div>
      <div style={{ color: '#fff' }} onClick={() => setActiveComponent(null)}>
        Back
      </div>
      <div className="ai-settings">
        <div className="content">
          <Box className="ai-checkbox">
            <div className="include">
              <div>
                Use <span>AI</span> to analyse and describe your gif while
                creating it
              </div>
              <Checkbox
                onChange={handleOnChangeAICheckbox}
                checked={aiChecked}
              />
            </div>
            <div className="include">
              <div>
                Use <span>AI</span> to to generate an example email for your gif
                while creating it
              </div>
              <Checkbox
                onChange={handleOnChangeAIExampleEmailCheckbox}
                checked={aiEmailChecked}
              />
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default AiSettingsComponent;
