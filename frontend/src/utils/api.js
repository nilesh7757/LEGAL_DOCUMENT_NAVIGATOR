import axios from '../api/axios';

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await axios.post('summarizer/summarize/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const sendChatMessage = async (sessionId, message) => {
  const response = await axios.post('summarizer/chat/', {
    session_id: sessionId,
    message: message,
  });
  return response.data;
};

export const getUserSessions = async () => {
  const response = await axios.get('summarizer/sessions/');
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await axios.get(`summarizer/sessions/${sessionId}/`);
  return response.data;
};
