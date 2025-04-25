import { useState, useEffect } from 'react';
import VinylShelf from '@/components/VinylShelf';
import Turntable from '@/components/Turntable';
import { initializePlayer } from '@/spotify/spotify';
import { useToast } from "@/components/ui/use-toast";

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

const PlayerPage = () => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isSDKReady, setIsSDKReady] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          setIsSDKReady(true);
        };
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
        window.onSpotifyWebPlaybackSDKReady = () => {};
      };
    } else {
      setIsSDKReady(true);
    }
  }, []);

  useEffect(() => {
    if (isSDKReady) {
      const setupPlayer = async () => {
        try {
          const spotifyPlayer = await initializePlayer();
          
          spotifyPlayer.addListener('ready', ({ device_id }) => {
            console.log('Spotify player ready with device ID:', device_id);
            setDeviceId(device_id);
            setPlayer(spotifyPlayer);
            
            toast({
              title: "Connected to Spotify",
              description: "Your vinyl player is ready to spin some records",
            });
          });

          spotifyPlayer.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID is not ready for playback', device_id);
          });

          spotifyPlayer.addListener('initialization_error', ({ message }) => {
            console.error('Failed to initialize player:', message);
            toast({
              title: "Playback Error",
              description: "Failed to initialize Spotify player. Do you have a Premium account?",
              variant: "destructive",
            });
          });

          spotifyPlayer.addListener('authentication_error', ({ message }) => {
            console.error('Failed to authenticate:', message);
            toast({
              title: "Authentication Error",
              description: "Please log in again",
              variant: "destructive",
            });
          });

          spotifyPlayer.addListener('account_error', ({ message }) => {
            console.error('Account error:', message);
            toast({
              title: "Account Error",
              description: "Premium subscription is required for playback",
              variant: "destructive",
            });
          });
        } catch (error) {
          console.error('Failed to initialize Spotify player:', error);
        }
      };

      setupPlayer();
    }
  }, [isSDKReady, toast]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAlbumSelect = (album: Album) => {
    console.log('Album selected:', album.name);
  };

  return (
    <div className="min-h-screen reactive-gradient p-4">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-vinyl-cream">Vinyl Player</h1>
        <p className="text-vinyl-gold">Your digital record collection</p>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        <Turntable player={player} deviceId={deviceId} />
        
        <div className="bg-vinyl-black bg-opacity-80 rounded-lg p-4 text-vinyl-cream text-center text-sm">
          <p>Drag an album from your collection to the turntable to start playing</p>
        </div>
        
        <VinylShelf onAlbumSelect={handleAlbumSelect} />
      </div>
    </div>
  );
};

export default PlayerPage;
