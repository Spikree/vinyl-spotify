
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Disc as AlbumIcon
} from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { startPlayback, pausePlayback, skipToNext, skipToPrevious } from '@/spotify/spotify';

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  uri: string;
}

interface Track {
  name: string;
  artists: { name: string }[];
  duration_ms: number;
}

interface TurntableProps {
  player: Spotify.Player | null;
  deviceId: string | null;
}

const Turntable = ({ player, deviceId }: TurntableProps) => {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [armPosition, setArmPosition] = useState<string>('rotate(-30deg)');
  
  const turntableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (player) {
      player.addListener('player_state_changed', (state: Spotify.WebPlaybackState) => {
        if (!state) return;
        
        setIsPlaying(!state.paused);
        
        if (state.track_window.current_track) {
          setCurrentTrack({
            name: state.track_window.current_track.name,
            artists: state.track_window.current_track.artists,
            duration_ms: state.track_window.current_track.duration_ms,
          });
        }
      });
      
      return () => {
        player.removeListener('player_state_changed');
      };
    }
  }, [player]);

  useEffect(() => {
    if (isPlaying) {
      setArmPosition('rotate(0deg)');
    } else {
      setArmPosition('rotate(-30deg)');
    }
  }, [isPlaying]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (turntableRef.current) {
      turntableRef.current.classList.add('bg-vinyl-gold');
      turntableRef.current.classList.add('bg-opacity-20');
    }
  };

  const handleDragLeave = () => {
    if (turntableRef.current) {
      turntableRef.current.classList.remove('bg-vinyl-gold');
      turntableRef.current.classList.remove('bg-opacity-20');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (turntableRef.current) {
      turntableRef.current.classList.remove('bg-vinyl-gold');
      turntableRef.current.classList.remove('bg-opacity-20');
    }

    const albumData = e.dataTransfer.getData('album');
    if (albumData && deviceId) {
      const album = JSON.parse(albumData) as Album;
      setCurrentAlbum(album);

      // Start playback when album is dropped
      try {
        await startPlayback(deviceId, album.uri);
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to start playback:', error);
      }
    }
  };

  const togglePlayback = async () => {
    if (!deviceId || !currentAlbum) return;

    try {
      if (isPlaying) {
        await pausePlayback();
      } else {
        await startPlayback(deviceId, currentAlbum.uri);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const handleNextTrack = async () => {
    try {
      await skipToNext();
    } catch (error) {
      console.error('Failed to skip to next track:', error);
    }
  };

  const handlePrevTrack = async () => {
    try {
      await skipToPrevious();
    } catch (error) {
      console.error('Failed to skip to previous track:', error);
    }
  };

  return (
    <div className="p-4">
      <div 
        ref={turntableRef}
        className="bg-vinyl-black rounded-lg p-8 shadow-xl transition-all duration-300"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Turntable platter */}
          <div className="relative w-64 h-64 rounded-full bg-vinyl-black border-8 border-vinyl-gold border-opacity-30 flex items-center justify-center">
            {currentAlbum ? (
              <>
                {/* Vinyl record */}
                <div className={`absolute inset-0 rounded-full bg-black ${isPlaying ? 'animate-spin-vinyl' : ''} vinyl-record`}>
                  <div className="vinyl-grooves"></div>
                </div>
                
                {/* Album art in the center */}
                <div className="absolute inset-0 m-16 rounded-full overflow-hidden z-10">
                  <img 
                    src={currentAlbum.images[0]?.url} 
                    alt={currentAlbum.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Tonearm */}
                <div 
                  className="tonearm"
                  style={{ transform: armPosition, transition: 'transform 1.5s ease-out' }}
                ></div>
              </>
            ) : (
              <div className="text-vinyl-cream text-center opacity-60 flex flex-col items-center">
                <AlbumIcon size={48} strokeWidth={1} />
                <p className="mt-2">Drop an album here</p>
              </div>
            )}
          </div>
          
          {/* Controls and track info */}
          <div className="flex flex-col items-center md:items-start space-y-4 w-full md:w-auto">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-medium text-vinyl-cream truncate max-w-xs">
                {currentTrack ? currentTrack.name : 'No track playing'}
              </h3>
              <p className="text-vinyl-gold opacity-80 truncate max-w-xs">
                {currentTrack 
                  ? currentTrack.artists.map(artist => artist.name).join(', ')
                  : 'Drop an album to start playing'}
              </p>
              {currentAlbum && (
                <p className="text-vinyl-cream text-sm opacity-60 mt-1">
                  From: {currentAlbum.name}
                </p>
              )}
            </div>
            
            {/* Playback controls */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                size="icon"
                onClick={handlePrevTrack}
                disabled={!currentAlbum}
                className="bg-vinyl-black text-vinyl-gold border-vinyl-gold"
              >
                <SkipBack />
              </Button>
              
              <Button 
                size="icon"
                onClick={togglePlayback}
                disabled={!currentAlbum}
                className={`w-12 h-12 rounded-full ${isPlaying ? 'bg-vinyl-cream text-vinyl-black' : 'bg-vinyl-gold text-vinyl-black'}`}
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                onClick={handleNextTrack}
                disabled={!currentAlbum}
                className="bg-vinyl-black text-vinyl-gold border-vinyl-gold"
              >
                <SkipForward />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turntable;
