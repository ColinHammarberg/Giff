import React, { useEffect, useState } from 'react';
import UserLogo from './UserLogo';
import { showNotification } from '../notification/Notification';
import { UploadUserLogo } from '../../endpoints/UserEndpoints';

function LogoUploadForm(props) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    // Handle file selection and update the state
    setSelectedFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    // Check if a file is selected and the "Upload Logo" button is clicked
    if (selectedFile) {
      try {
        const response = await UploadUserLogo(selectedFile);
        const data = response.data;
        console.log('data', data);
  
        if (data.message === "Logo uploaded!") {
          // New logo URL from server response
          const newLogoUrl = data.logo_url;
  
          props.setChangeUserDetails(newLogoUrl)
  
          const userData = sessionStorage.getItem('user');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            parsedUserData.userLogoSrc = newLogoUrl;
            sessionStorage.setItem('user', JSON.stringify(parsedUserData));
          }
  
          showNotification('success', 'Champ! Your logo was successfully uploaded!');
        }
      } catch (error) {
        showNotification('error', 'Your logo failed to be uploaded! Please try again.');
      }
      // Reset the selected file state
      setSelectedFile(null);
    }
  };
  

  useEffect(() => {
    document.getElementById('custom-button')?.addEventListener('click', function () {
      document.getElementById('logo-file').click();
    });
  }, []);

  return (
    <>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="text">
          <span>Logo</span>
          {!props.isMobile && (
            <button type="submit" disabled={!selectedFile}>
              {props.userLogoSrc ? 'Delete Logo' : 'Upload Logo'}
            </button>
          )}
        </div>
        <div className="upload">
          {props.isMobile && (
            <button type="submit" disabled={!selectedFile}>
              Edit
            </button>
          )}
          {props.userLogoSrc ? (
            <UserLogo userLogoSrc={props.userLogoSrc} />
          ) : (
            <label htmlFor="logo-file" id="custom-button" className="custom-button">
              Choose File
            </label>
          )}
        </div>
        <input
          type="file"
          id="logo-file"
          name="logo"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button type="submit" style={{ display: 'none' }}></button>
      </form>
    </>
  );
}

export default LogoUploadForm;
