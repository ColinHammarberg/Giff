import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import './EditProfileComponent.scss';
import PasswordField from '../authorization/PasswordField';
import {
  DeleteUserProfile,
  ResendVerificationEmail,
  UpdateAdditionalUserDetails,
  UpdateEmailAddress,
  UpdatePassword,
} from '../../endpoints/UserEndpoints';
import { showNotification } from '../notification/Notification';
import DeleteProfileDialog from './DeleteProfileDialog';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antigua &amp; Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia &amp; Herzegovina',
  'Botswana',
  'Brazil',
  'British Virgin Islands',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Cape Verde',
  'Cayman Islands',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Congo',
  'Cook Islands',
  'Costa Rica',
  'Cote D Ivoire',
  'Croatia',
  'Cruise Ship',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Estonia',
  'Ethiopia',
  'Falkland Islands',
  'Faroe Islands',
  'Fiji',
  'Finland',
  'France',
  'French Polynesia',
  'French West Indies',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guam',
  'Guatemala',
  'Guernsey',
  'Guinea',
  'Guinea Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Isle of Man',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jersey',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Kyrgyz Republic',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Nepal',
  'Netherlands',
  'Netherlands Antilles',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Reunion',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Pierre &amp; Miquelon',
  'Samoa',
  'San Marino',
  'Satellite',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'St Kitts &amp; Nevis',
  'St Lucia',
  'St Vincent',
  'St. Lucia',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  "Timor L'Este",
  'Togo',
  'Tonga',
  'Trinidad &amp; Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks &amp; Caicos',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Virgin Islands (US)',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

function EditProfileComponent({
  user,
  setActiveComponent,
  setChangeUserDetails,
}) {
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.organization || '');
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const navigate = useNavigate();
  const [country, setCountry] = useState(user?.country || '');
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  async function handleOnResendEmailVerification() {
    try {
      const response = await ResendVerificationEmail();
      if (response.status === 'Sent new email verification link') {
        showNotification(
          'success',
          `Sent verification email to ${user?.email}`
        );
      }
    } catch (error) {
      showNotification('error', 'Failed to send verification email.');
    }
  }

  const handleCompanyChange = (event) => {
    setCompany(event.target.value);
  };

  // Store initial values to check for changes
  const [initialValues, setInitialValues] = useState({
    email: user?.email || '',
    company: user?.organization || '',
    country: user?.country || '',
  });

  useEffect(() => {
    setInitialValues({
      email: user?.email || '',
      company: user?.organization || '',
      country: user?.country || '',
    });
  }, [user]);

  const handleOnChangePassword = (e, field) => {
    setPassword({
      ...password,
      [field]: e.target.value,
    });
  };

  const handleOnChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const requestChangeUserPassword = async (passwordData) => {
    try {
      const response = await UpdatePassword(passwordData);
      console.log('response', response);
    } catch (error) {
      showNotification('error', 'Failed to update password');
    }
  };

  const requestChangeUserEmail = async (newEmail) => {
    try {
      const response = await UpdateEmailAddress({ newEmail });
      console.log('response', response);
    } catch (error) {
      showNotification(
        'error',
        'Email was not updated successfully. Please try again!'
      );
    }
  };

  const handleSave = async () => {
    if (email !== initialValues.email) {
      await requestChangeUserEmail(email);
    }
    if (password.currentPassword && password.newPassword) {
      await requestChangeUserPassword(password);
    }
    if (
      country !== initialValues.country ||
      company !== initialValues.company
    ) {
      await UpdateAdditionalUserDetails(country, company);
    }
    showNotification('success', 'Your details were successfully updated!');
    
    setInitialValues({ email, country });
    setChangeUserDetails(true);
  };
  const handleOnClickDeleteAccount = async () => {
    const { hasConfirmed } = await DeleteProfileDialog.show();
    let response;
    if (!hasConfirmed) {
      return;
    } else {
      try {
        response = await DeleteUserProfile();
        if (response.data.status === 'Profile deleted') {
          localStorage.removeItem('access_token');
          navigate('/');
          showNotification('success', response.data.status);
        }
      } catch (error) {
        showNotification(
          'error',
          'Failed to delete account. Please try again!'
        );
      }
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
        Edit Profile
      </div>
      <div className="back-button">
        <BackButton onClick={() => setActiveComponent(null)} variant="white" />
      </div>
      <div className="edit-profile">
        <div className="content">
          <div classname="group">
            <div className="email">
              <span>Email</span>
              <div className="actions">
                <TextField
                  type="email"
                  onChange={(e) => handleOnChangeEmail(e, 'newEmail')}
                  defaultValue={user?.email}
                />
                {!user?.is_active && (
                  <Button onClick={handleOnResendEmailVerification}>
                    Verify
                  </Button>
                )}
              </div>
            </div>
            <div className="password">
              <div className="fields">
                <div className="field">
                  <span>Current password</span>
                  <PasswordField
                    type="password"
                    placeholder="******"
                    onChange={(e) =>
                      handleOnChangePassword(e, 'currentPassword')
                    }
                    defaultValue={password?.currentPassword}
                  />
                </div>
                <div className="field">
                  <span>New password</span>
                  <PasswordField
                    type="password"
                    placeholder="******"
                    onChange={(e) => handleOnChangePassword(e, 'newPassword')}
                    defaultValue={password?.newPassword}
                  />
                </div>
              </div>
            </div>
          </div>
          <div classname="group">
            <div className="company">
              <span>Company</span>
              <TextField
                className="company"
                onChange={handleCompanyChange}
                defaultValue={user?.organization}
              />
            </div>
            <div className="location">
              <span>Country</span>
              <FormControl fullWidth>
                <Select
                  labelId="country-select-label"
                  id="country-select"
                  value={country}
                  label="Country"
                  onChange={handleCountryChange}
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
      <div className="action-save">
        <Button onClick={handleOnClickDeleteAccount} className="save">
          Delete Account
        </Button>
        <Button onClick={handleSave} className="save">
          Save
        </Button>
      </div>
    </div>
  );
}

export default EditProfileComponent;
