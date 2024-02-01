import { Button, FormControl, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import './EditProfileComponent.scss';
import { showNotification } from '../notification/Notification';
import BackButton from './BackButton';
import LightTooltip from '../overall/LightToolTip';
import {
  ToggleEmailAI,
  ToggleIncludeAI,
} from '../../endpoints/GifCreationEndpoints';

// const ResolutionOptions = [
//   { id: 9, value: '100x100' },
//   { id: 10, value: '300x300' },
//   { id: 14, value: '600x600' },
//   { id: 15, value: '700x700' },
//   { id: 16, value: '800x800' },
//   { id: 18, value: '1000x1000' },
//   { id: 24, value: '1280x1000' },
//   { id: 14, value: 'unset' },
// ];

const AIOptions = [
  { id: 'none', label: 'No AI Feature' },
  { id: 'describe_gif', label: 'Use AI to Describe Gif' },
  { id: 'example_email', label: 'Use AI for Example Email' },
];

function GifSettingsComponent({ user, setActiveComponent, setChangeUserDetails }) {
  // const [resolution, setResolution] = useState(user?.resolution || '');
  const [selectedAI, setSelectedAI] = useState(
    user?.include_ai
      ? 'describe_gif'
      : user?.include_example_email
      ? 'example_email'
      : 'none'
  );

  // const handleResolutionChange = (event) => {
  //   setResolution(event.target.value);
  // };
  const handleAIChange = (event) => {
    setSelectedAI(event.target.value);
  };

  // Store initial values to check for changes
  const [initialValues, setInitialValues] = useState({
    // resolution: user?.resolution || '',
    selectedAI: user?.include_ai
      ? 'describe_gif'
      : user?.include_example_email
      ? 'example_email'
      : 'none',
  });

  useEffect(() => {
    setInitialValues({
      // resolution: user?.resolution || '',
      selectedAI: user?.include_ai
        ? 'describe_gif'
        : user?.include_example_email
        ? 'example_email'
        : 'none',
    });
  }, [user]);

  const handleSave = async () => {
    let updated = false;

    // Save resolution if it's changed
    // if (resolution !== initialValues.resolution) {
    //   await SaveUserResolution(resolution);
    //   updated = true;
    // }

    // Save AI settings based on selectedAI value
    if (selectedAI !== initialValues.selectedAI) {
      updated = true;

      if (selectedAI === 'describe_gif') {
        await ToggleIncludeAI({ includeAI: true });
      } else if (selectedAI === 'example_email') {
        await ToggleEmailAI({ includeExampleEmail: true });
      } else {
        // Handle case for no AI feature selected
        await ToggleEmailAI({ includeExampleEmail: false });
        await ToggleIncludeAI({ includeAI: false });
      }
    }

    if (updated) {
      showNotification('success', 'Your settings were successfully updated!');
      setInitialValues({ selectedAI });
      setChangeUserDetails(true);
    }
  };

  console.log('user', user);

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
        Edit Gif Settings
      </div>
      <div className="back-button">
        <BackButton onClick={() => setActiveComponent(null)} variant="white" />
      </div>
      <div className="edit-profile">
        <div className="content">
          <div className="group">
            <div className="ai-option">
              <div className="info">
                AI Options{' '}
                <LightTooltip
                  title="Choose an AI feature to enhance your gif creation process."
                  placement="right"
                >
                  <InfoIcon />
                </LightTooltip>
              </div>
              <FormControl fullWidth>
                <Select
                  labelId="ai-option-select-label"
                  id="ai-option-select"
                  value={selectedAI}
                  label="AI Option"
                  onChange={handleAIChange}
                >
                  {AIOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          {/* <div classname="group">
            <div className="resolution">
              <div className="info">
                Gif resolution{' '}
                <LightTooltip
                  title="Select your preferred resolution for downloading gifs."
                  placement="right"
                >
                  <InfoIcon />
                </LightTooltip>
              </div>
              <FormControl fullWidth>
                <Select
                  labelId="resolution-select-label"
                  id="country-select"
                  value={resolution}
                  label="Country"
                  onChange={handleResolutionChange}
                >
                  {ResolutionOptions.map((choice) => (
                    <MenuItem key={choice.id} value={choice.value}>
                      {choice.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div> */}
        </div>
      </div>
      <div className="action-save">
        <Button onClick={handleSave} className="save">
          Save
        </Button>
      </div>
    </div>
  );
}

export default GifSettingsComponent;
