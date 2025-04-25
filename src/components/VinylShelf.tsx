
import { useState, useEffect } from 'react';
import { getUserAlbums } from '@/spotify/spotify';
import { useToast } from "@/components/ui/use-toast";

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

interface VinylShelfProps {
  onAlbumSelect: (album: Album) => void;
}

const VinylShelf = ({ onAlbumSelect }: VinylShelfProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const response = await getUserAlbums(50);
        const albumList = response.items.map((item: any) => ({
          id: item.album.id,
          name: item.album.name,
          artists: item.album.artists,
          images: item.album.images,
          uri: item.album.uri,
        }));
        setAlbums(albumList);
      } catch (error) {
        console.error('Failed to fetch albums', error);
        toast({
          title: "Error fetching your albums",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [toast]);

  const handleDragStart = (e: React.DragEvent, album: Album) => {
    e.dataTransfer.setData('album', JSON.stringify(album));
    // Create a custom drag image
    const dragImage = new Image();
    dragImage.src = album.images[0]?.url || '';
    e.dataTransfer.setDragImage(dragImage, 75, 75);
  };

  return (
    <div className="p-6 bg-vinyl-wood bg-opacity-90 record-player-cabinet min-h-[200px] rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold mb-4 text-vinyl-cream">Your Vinyl Collection</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vinyl-gold"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
            <div 
              key={album.id}
              className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => onAlbumSelect(album)}
              draggable
              onDragStart={(e) => handleDragStart(e, album)}
            >
              <div className="w-full aspect-square bg-vinyl-black rounded-md overflow-hidden shadow-lg">
                <img 
                  src={album.images[0]?.url} 
                  alt={album.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 text-center p-2 transition-opacity">
                  <p className="text-white font-semibold truncate">{album.name}</p>
                  <p className="text-gray-300 text-sm truncate">{album.artists.map(artist => artist.name).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VinylShelf;
