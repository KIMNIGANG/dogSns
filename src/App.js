import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [snsSentence, setSnsSentence] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      // Convert the image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];

        // Call the backend to process the image
        const response = await axios.post('http://localhost:5001/api/process-image', { image: base64Image });

        // Display the SNS sentence
        setSnsSentence(response.data.snsSentence);
      };
    } catch (error) {
      console.error('Error processing the image:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  return (
    <div className="App">
      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <p>Drag and drop an image or click to select</p>
      </div>
      <div className='img'>

      {previewImage && <img className="preview-image" src={previewImage} alt="Preview" />}
      <button className='btn' onClick={handleSubmit}>Submit</button>
      <div className="output">
        <h2>Generated SNS sentence:</h2>
        <p className="sentence">{snsSentence}</p>
      </div>
      </div>
    </div>
  );
}

export default App;
