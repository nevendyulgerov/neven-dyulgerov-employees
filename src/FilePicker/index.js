import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './index.css';

const FilePicker = (props) => {
  const { accept, minSize, maxSize, disabled, onDrop, onUpload } = props;

  const handleDrop = useCallback((acceptedFiles) => {
    onDrop(acceptedFiles);

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      if (onUpload) {
        reader.onload = () => {
          onUpload(file, reader.result);
        };
      }

      reader.readAsArrayBuffer(file);
    });
  }, [onDrop, onUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    minSize,
    maxSize,
    onDrop: handleDrop
  });

  return (
    <div
      {...getRootProps()}
      className="file-picker"
    >
      <input
        {...getInputProps()}
        disabled={disabled}
      />

      <div className="file-picker__label">
        <span>Drag and drop files here or Browse</span>
      </div>
    </div>
  );
};

export default FilePicker;
