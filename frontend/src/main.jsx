import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import './styles/global.css';
import './styles/components.css';
import './styles/home.css';
import './styles/pages.css';
import './styles/loader.css';
import './styles/admin.css';

import { EnquiryProvider } from './context/EnquiryContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';

import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ArtifactDetailPage from './pages/ArtifactDetailPage';
import HeritagePage from './pages/HeritagePage';
import OurStoryPage from './pages/OurStoryPage';
import JournalPage from './pages/JournalPage';
import JournalDetailPage from './pages/JournalDetailPage';
import EnquirePage from './pages/EnquirePage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { PrivacyPage, TermsPage } from './pages/LegalPages';

import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <div className="site">
      <Loader />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:slug" element={<ArtifactDetailPage />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />
          <Route path="/enquire" element={<EnquirePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <EnquiryProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </EnquiryProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);