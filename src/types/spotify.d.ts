
interface Window {
    Spotify: {
      Player: new (options: Spotify.PlayerInit) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
  
  declare namespace Spotify {
    interface PlayerInit {
      name: string;
      getOAuthToken: (callback: (token: string) => void) => void;
      volume?: number;
    }
  
    interface WebPlaybackPlayer {
      device_id: string;
    }
  
    interface WebPlaybackState {
      context: {
        uri: string;
        metadata: any;
      };
      disallows: {
        pausing: boolean;
        peeking_next: boolean;
        peeking_prev: boolean;
        resuming: boolean;
        seeking: boolean;
        skipping_next: boolean;
        skipping_prev: boolean;
      };
      duration: number;
      paused: boolean;
      position: number;
      repeat_mode: number;
      shuffle: boolean;
      track_window: {
        current_track: WebPlaybackTrack;
        next_tracks: WebPlaybackTrack[];
        previous_tracks: WebPlaybackTrack[];
      };
    }
  
    interface WebPlaybackTrack {
      album: {
        uri: string;
        name: string;
        images: { url: string }[];
      };
      artists: {
        name: string;
        uri: string;
      }[];
      duration_ms: number;
      id: string;
      is_playable: boolean;
      name: string;
      uri: string;
    }
  
    interface WebPlaybackError {
      message: string;
    }
  
    interface Player {
      connect(): Promise<boolean>;
      disconnect(): void;
      addListener(eventName: 'ready' | 'not_ready', callback: (state: WebPlaybackPlayer) => void): boolean;
      addListener(eventName: 'player_state_changed', callback: (state: WebPlaybackState) => void): boolean;
      addListener(eventName: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error', callback: (error: WebPlaybackError) => void): boolean;
      removeListener(eventName: string): boolean;
      getCurrentState(): Promise<WebPlaybackState | null>;
      setName(name: string): Promise<void>;
      getVolume(): Promise<number>;
      setVolume(volume: number): Promise<void>;
      pause(): Promise<void>;
      resume(): Promise<void>;
      togglePlay(): Promise<void>;
      seek(position_ms: number): Promise<void>;
      previousTrack(): Promise<void>;
      nextTrack(): Promise<void>;
    }
  }
  