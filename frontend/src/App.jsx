import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import RecentPage from './pages/RecentPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/recent" element={<RecentPage />} />
            <Route path="/extraction/:id" element={<ResultPage />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Geist, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(70,72,212,0.1)',
          },
          success: {
            iconTheme: { primary: '#15803d', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#93000a', secondary: '#fff' },
          },
        }}
        className="toaster"
      />
    </BrowserRouter>
  );
}
