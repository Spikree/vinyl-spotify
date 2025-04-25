
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from '@/spotify/spotify';
import { useToast } from "@/components/ui/use-toast";

const CallbackHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        setError(error);
        toast({
          title: "Authorization Error",
          description: `Spotify authorization failed: ${error}`,
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code found in the URL');
        toast({
          title: "Authentication Error",
          description: "No authorization code found",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        await getAccessToken(code);
        navigate('/player');
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        setError('Failed to exchange authorization code for access token');
        toast({
          title: "Authentication Error",
          description: "Failed to authenticate with Spotify",
          variant: "destructive",
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-vinyl-wood bg-opacity-80 record-player-cabinet">
      <div className="p-8 bg-vinyl-black bg-opacity-90 rounded-lg shadow-xl max-w-md w-full text-center">
        {error ? (
          <div>
            <h2 className="text-2xl font-semibold text-red-500 mb-2">Authentication Failed</h2>
            <p className="text-vinyl-cream mb-4">{error}</p>
            <p className="text-vinyl-gold">Redirecting you back to login...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-vinyl-gold mb-2">Authenticating...</h2>
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-vinyl-gold"></div>
            </div>
            <p className="text-vinyl-cream">Connecting to your Spotify account</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackHandler;
