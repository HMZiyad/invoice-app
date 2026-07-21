import axios from 'axios';

// In Docker, nginx proxies /api → backend. In dev, Vite proxies /api → localhost:4000.
// Using a relative URL works for both.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min — n8n can be slow
});

export const invoiceApi = {
  upload: (file, onUploadProgress) => {
    const form = new FormData();
    form.append('file', file);
    return client.post('/invoices/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  list: (search = '') =>
    client.get('/invoices', { params: search ? { search } : {} }),

  getById: (id) => client.get(`/invoices/${id}`),

  delete: (id) => client.delete(`/invoices/${id}`),

  exportJsonUrl: (id) => `${BASE_URL}/invoices/${id}/export/json`,

  exportCsvUrl: (id) => `${BASE_URL}/invoices/${id}/export/csv`,

  // In Docker, uploads are proxied via nginx. In dev, Vite proxies /uploads.
  fileUrl: (filePath) => `/${filePath}`,
};

export default client;
