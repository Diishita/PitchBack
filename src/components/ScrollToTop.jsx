import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Exclude contact page from scroll-to-top as per user requirement
    if (location.pathname !== '/contact') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}
