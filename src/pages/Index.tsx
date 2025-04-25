import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('spotify_access_token');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/player');
    } else {
      navigate('/login');
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-vinyl-wood bg-opacity-80">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-vinyl-cream mb-4">Loading Vinyl Player...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vinyl-gold mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
