// components/SpotifyLoginButton.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSpotifyLogin = () => {
    setIsLoading(true);
    
    // Simulate loading state for demo purposes
    setTimeout(() => {
      console.log("Logging in with Spotify");
      setIsLoading(false);
      // Add your Spotify OAuth logic here
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
   
      
      <Button
        variant="outline"
        size="lg"
        onClick={handleSpotifyLogin}
        disabled={isLoading}
        className="bg-[#1DB954] hover:bg-[#1ed760] text-white border-none px-6 py-6 rounded-full transition-all duration-300 relative overflow-hidden group"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        
        <span className="flex items-center gap-3 relative z-10">
          {/* Spotify Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6"
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.8-.179-.92-.6-.12-.421.18-.8.6-.9C10.5 13.97 14.4 14.4 17.64 16.38c.36.219.48.66.24 1.02zm1.44-3.3c-.301.42-.84.54-1.261.24-3.12-1.939-7.859-2.5-11.58-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 14.76 10.5 18.301 12.66c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          
          {isLoading ? "Connecting..." : "Login with Spotify"}
        </span>
      </Button>
    </div>
  );
};

export default Login;