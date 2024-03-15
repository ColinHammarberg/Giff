import React, { useState, forwardRef, useImperativeHandle } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { showNotification } from '../notification/Notification';
import { UploadPdfThenCreateGif, UploadVideoThenCreateGif } from '../../endpoints/GifCreationEndpoints';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const UploadPdfGifForm = forwardRef(
  (
    {
      selectedFile,
      setSelectedFile,
      setIsLoading,
      setGifGenerated,
    },
    ref
  ) => {
    const [dragOver, setDragOver] = useState(false);
    const validateFileSize = (file) => file.size <= MAX_FILE_SIZE;

    const handleValidateFileSize = (file) => {
      if (!validateFileSize(file)) {
        showNotification('error', 'File size must be below 20MB. You can also enter a youtube link to your video.');
        return false;
      }
      console.log('file', file);
      setSelectedFile(file);
      return true;
    };

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
      if (
        file &&
        ((file.type === 'application/pdf') || file.type.startsWith('video/')) &&
        handleValidateFileSize(file)
      ) {
        setSelectedFile(file);
      }
    };

    const handlePdfChange = (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      if (
        file &&
        ((file.type === 'application/pdf' || file.type.startsWith('video/'))) &&
        handleValidateFileSize(file)
      ) {
        setSelectedFile(file);
      }
    };

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      console.log('selectedFile', selectedFile);
      if (!selectedFile) {
        showNotification(
          'error',
          'No file selected. Please choose a file to upload.'
        );
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (selectedFile.type === 'application/pdf') {
          response = await UploadPdfThenCreateGif(selectedFile);
        }
        else if (selectedFile.type.startsWith('video/')) {
          response = await UploadVideoThenCreateGif(selectedFile);
        } else {
          setIsLoading(false);
          showNotification(
            'error',
            'Unsupported file type. Please upload a PDF or a video.'
          );
          return;
        }
        console.log('response', response);
        if (response.data.message === 'GIF generated and uploaded!') {
          const responseData = response.data;
          setGifGenerated(responseData.data);
          showNotification('success', 'GIF generated successfully!');
        } else {
          showNotification(
            'error',
            'Failed to generate GIF. Please try again.'
          );
        }
      } catch (error) {
        showNotification(
          'error',
          'An error occurred while processing your request. Please try again later.'
        );
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
        setSelectedFile(null);
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
          <span className="drag">Drag and drop a pdf or video</span>
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
            accept=".pdf,video/*"
            onChange={handlePdfChange}
            style={{ display: 'none' }}
          />
        </form>
      </>
    );
  }
);

export default UploadPdfGifForm;
