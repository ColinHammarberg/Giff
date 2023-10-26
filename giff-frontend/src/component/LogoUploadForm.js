import React, { useEffect, useState } from 'react';
import { UploadUserLogo } from '../endpoints/Apis';

function LogoUploadForm() {
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
      } catch (error) {
        console.error('Error:', error);
      }

      // Reset the selected file state
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    // Your JavaScript code that accesses DOM elements goes here
    document.getElementById('custom-button').addEventListener('click', function () {
      document.getElementById('logo-file').click();
    });
  }, []);

  return (
    <>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="text">
          <span>Logo</span>
          <button type="submit" disabled={!selectedFile}>
            Upload Logo
          </button>
        </div>
        <label htmlFor="logo-file" id="custom-button" className="custom-button">
          Choose File
        </label>
        <input
          type="file"
          id="logo-file"
          name="logo"
          accept=".png, .jpg, .jpeg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </form>
    </>
  );
}

export default LogoUploadForm;
