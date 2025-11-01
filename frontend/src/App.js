import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState('');

  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    addMessage('bot', 'Hello! What kind of legal document would you like to generate?');
  }, []);

  const addMessage = (sender, text) => {
    setMessages(prevMessages => [...prevMessages, { sender, text }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat/', { messages: newMessages });
      const botResponse = response.data;

      if (botResponse.type === 'document') {
        setDocumentContent(botResponse.text);
        addMessage('bot', 'Here is your document:');
      } else {
        addMessage('bot', botResponse.text);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      addMessage('bot', 'Sorry, something went wrong. Please try again.');
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!documentContent) {
      alert('No document to download.');
      return;
    }

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
        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className="message bot">...</div>}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            Send
          </button>
        </div>
        {documentContent && (
          <div className="document-preview">
            <h2>Generated Document</h2>
            <div className="preview-content">
              <ReactMarkdown>{documentContent}</ReactMarkdown>
            </div>
            <button onClick={handleDownload}>Download as PDF</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;