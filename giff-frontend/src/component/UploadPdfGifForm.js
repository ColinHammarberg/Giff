import { TextField } from '@mui/material';
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { UploadPdfThenCreateGif } from '../endpoints/Apis';
import { showNotification } from './Notification';

const UploadPdfGifForm = forwardRef(({ selectedPdf, setSelectedPdf, setIsLoading, setGifGenerated }, ref) => {

  useEffect(() => {
    document.getElementById('custom-button').addEventListener('click', function () {
      document.getElementById('pdf-file').click();
    });
  }, []);

  const handlePdfChange = (e) => {
    setSelectedPdf(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (selectedPdf) {
      setIsLoading(true);
      try {
        const response = await UploadPdfThenCreateGif(selectedPdf);
        if (response.data.message === "PDF uploaded and GIF generated!") {
          const responseData = response.data;
          setGifGenerated(responseData.data);
          showNotification('success', 'PDF uploaded and GIF generated!');
        } else {
          showNotification('error', 'Failed to generate GIF from PDF. Please try again.');
        }
      } catch (error) {
        showNotification('error', 'An error occurred while processing your request. Please try again later.');
      }
      // Reset the selected PDF state
      setIsLoading(false);
      setSelectedPdf(null);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleFormSubmit(new Event('submit'));
    }
  }));

  return (
    <>
      <form encType="multipart/form-data" onSubmit={handleFormSubmit}>
        <label htmlFor="pdf-file" id="custom-button" className="custom-button">
          Upload pdf
        </label>
        <input
          type="file"
          id="pdf-file"
          name="pdf"
          accept=".pdf"
          onChange={handlePdfChange}
          style={{ display: 'none' }}
        />
        <TextField disabled value={selectedPdf?.name} />
      </form>
    </>
  );
});

export default UploadPdfGifForm;
