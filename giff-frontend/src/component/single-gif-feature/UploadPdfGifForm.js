import React, { useState, forwardRef, useImperativeHandle } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { showNotification } from '../notification/Notification';
import { UploadPdfThenCreateGif } from '../../endpoints/GifCreationEndpoints';

const UploadPdfGifForm = forwardRef(
  (
    { selectedPdf, setSelectedPdf, setIsLoading, setGifGenerated, sectorType },
    ref
  ) => {
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
      if (file && file.type === 'application/pdf') {
        setSelectedPdf(file);
      }
    };

    const handlePdfChange = (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      if (file && file.type === 'application/pdf') {
        setSelectedPdf(file);
      }
    };

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      if (selectedPdf) {
        setIsLoading(true);
        try {
          const response = await UploadPdfThenCreateGif(
            selectedPdf,
            sectorType
          );
          if (response.data.message === 'PDF uploaded and GIF generated!') {
            const responseData = response.data;
            setGifGenerated(responseData.data);
            showNotification('success', 'PDF uploaded and GIF generated!');
          } else {
            showNotification(
              'error',
              'Failed to generate GIF from PDF. Please try again.'
            );
          }
        } catch (error) {
          showNotification(
            'error',
            'An error occurred while processing your request. Please try again later.'
          );
        } finally {
          setIsLoading(false);
          setSelectedPdf(null);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        handleFormSubmit(new Event('submit'));
      },
    }));

    return (
      <>
        <form
          encType="multipart/form-data"
          onSubmit={handleFormSubmit}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            backgroundColor: dragOver ? 'rgba(0,0,0,0.1)' : '#3F3F3F',
          }}
        >
          <FileUploadIcon />
          <span className="drag">Drag and drop a pdf</span>
          <label htmlFor="pdf-file" className="custom-button">
            Click here
          </label>
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                backgroundColor: dragOver ? 'rgba(0,0,0,0.1)' : 'transparent',
                zIndex: dragOver ? 1 : -1,
              }}
            />
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
  }
);

export default UploadPdfGifForm;
