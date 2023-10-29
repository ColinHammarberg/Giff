import React, { useEffect, useState } from 'react';
import { showNotification } from './Notification';
import { UploadPdfThenCreateGif } from '../endpoints/Apis';

function UploadPdfGifForm(props) {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handlePdfChange = (e) => {
    // Handle PDF file selection and update the state
    setSelectedPdf(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check if a PDF file is selected and the "Generate GIF" button is clicked
    if (selectedPdf) {
      try {
        const response = await UploadPdfThenCreateGif(selectedPdf);
        const data = response.data;

        if (data.message === "PDF uploaded and GIF generated!") {
          // Handle success
          showNotification('success', 'PDF uploaded and GIF generated!');
        } else {
          // Handle other responses or errors
          showNotification('error', 'Failed to generate GIF from PDF. Please try again.');
        }
      } catch (error) {
        showNotification('error', 'An error occurred while processing your request. Please try again later.');
      }
      // Reset the selected PDF state
      setSelectedPdf(null);
    }
  };

  useEffect(() => {
    document.getElementById('custom-button').addEventListener('click', function () {
      document.getElementById('pdf-file').click();
    });
  }, []);

  return (
    <>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="text">
          <span>PDF</span>
          <button type="submit" disabled={!selectedPdf}>
            Generate GIF
          </button>
        </div>
        <label htmlFor="pdf-file" id="custom-button" className="custom-button">
          Choose PDF
        </label>
        <input
          type="file"
          id="pdf-file"
          name="pdf"
          accept=".pdf"
          onChange={handlePdfChange}
          style={{ display: 'none' }}
        />
      </form>
    </>
  );
}

export default UploadPdfGifForm;
