import { createContext, useContext, useState } from 'react';
import EnquiryModal from '../components/EnquiryModal';

const EnquiryContext = createContext(null);

export function EnquiryProvider({ children }) {
  const [state, setState] = useState({ open: false, artifact: null });

  const openEnquiry = (artifact) => setState({ open: true, artifact: artifact || null });
  const closeEnquiry = () => setState({ open: false, artifact: null });

  return (
    <EnquiryContext.Provider value={{ openEnquiry, closeEnquiry }}>
      {children}
      <EnquiryModal open={state.open} artifact={state.artifact} onClose={closeEnquiry} />
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used within EnquiryProvider');
  return ctx;
}