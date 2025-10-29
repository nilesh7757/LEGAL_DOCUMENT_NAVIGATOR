import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/generate/', { prompt });
      setDocumentContent(response.data.document);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please check the console for details.');
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!documentContent) {
      alert('No document to download.');
      return;
    }

    console.log('Document content being sent for PDF download:', documentContent);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/download-pdf/',
        { document_content: documentContent },
        { responseType: 'blob' } // Important: responseType must be 'blob'
      );

      // Create a blob from the response data
      const file = new Blob([response.data], { type: 'application/pdf' });

      // Create a link element, set its href to the blob, and click it to trigger download
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', 'legal_document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL); // Clean up the URL object
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please check the console for details.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Legal Document Generator</h1>
      </header>
      <main>
        <div className="prompt-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your legal document requirements here..."
            rows="10"
            cols="80"
          />
          <button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Document'}
          </button>
        </div>
        <div className="document-preview">
          <h2>Generated Document</h2>
          <div className="preview-content">
            <ReactMarkdown>{documentContent}</ReactMarkdown>
          </div>
          {documentContent && (
            <button onClick={handleDownload}>
              Download as PDF
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
