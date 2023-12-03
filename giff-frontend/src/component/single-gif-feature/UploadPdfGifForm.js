import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TextField } from '@mui/material';
import { showNotification } from '../notification/Notification';
import { UploadPdfThenCreateGif } from '../../endpoints/GifCreationEndpoints';

const UploadPdfGifForm = forwardRef(({ selectedPdf, setSelectedPdf, setIsLoading, setGifGenerated }, ref) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedPdf(file);
    }
  };

  const handlePdfChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedPdf(file);
    }
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
      } finally {
        setIsLoading(false);
        setSelectedPdf(null);
      }
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
      <label htmlFor="pdf-file" className="custom-button">
            Upload PDF
      </label>
        <div 
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ position: 'relative' }}
        >
          <TextField
            disabled
            value={selectedPdf?.name || ''}
            placeholder="Drag and drop a PDF here or click to upload"
            fullWidth
          />
          
          <div style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            height: '100%', 
            width: '100%', 
            backgroundColor: dragOver ? 'rgba(0,0,0,0.1)' : 'transparent',
            zIndex: dragOver ? 1 : -1,
          }} />
        </div>
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
});

export default UploadPdfGifForm;
