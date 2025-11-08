import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FileText, Download, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';

const DocumentVersions = () => {
  const { id } = useParams(); // conversation ID
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Document');

  useEffect(() => {
    const fetchDocumentVersions = async () => {
      try {
        const response = await axios.get(`documents/conversations/${id}/`);
        setDocumentTitle(response.data.title || 'Document');
        setVersions(response.data.document_versions || []);
      } catch (err) {
        console.error('Error fetching document versions:', err);
        setError('Failed to load document versions.');
        toast.error('Failed to load document versions.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentVersions();
  }, [id]);

  const handleDownloadVersionPdf = async (versionNumber) => {
    try {
      const response = await axios.get(`utils/conversations/${id}/versions/${versionNumber}/download-pdf/`, {
        responseType: 'blob', // Important for downloading files
      });
      const filename = `${documentTitle}_v${versionNumber}.pdf`;
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, filename);
      toast.success(`Version ${versionNumber} PDF downloaded!`);
    } catch (err) {
      console.error(`Error downloading version ${versionNumber} PDF:`, err);
      toast.error(`Failed to download version ${versionNumber} PDF.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center text-blue-600 text-xl font-medium">
          <History className="w-6 h-6 animate-spin mr-3" />
          Loading document versions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-xl font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <History className="w-10 h-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Document Versions</h1>
          </div>
          <p className="text-xl text-gray-600">Viewing versions for: <span className="font-semibold">{documentTitle}</span></p>
        </div>

        {versions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500 text-lg">
            No versions found for this document.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {versions.map((version) => (
              <div key={version.version_number} className="bg-white rounded-2xl shadow-xl p-6 flex items-center justify-between border border-gray-200 hover:border-blue-400 transition-all duration-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Version {version.version_number}</h2>
                  <p className="text-gray-500 text-sm">Created: {new Date(version.timestamp).toLocaleDateString()} {new Date(version.timestamp).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => handleDownloadVersionPdf(version.version_number)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => navigate(`/document-creation/${id}?version=${version.version_number}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Edit Version</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVersions;
