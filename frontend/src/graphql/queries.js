import { gql } from '@apollo/client/core';

// Comprehensive query to fetch all graph data for visualization
export const GET_GRAPH_DATA = gql`
  query GetGraphData {
    # Fetch all Artists with their relationships
    artists {
      id
      name
      nationality
      spotifyUrl
      
      # Get all albums for this artist
      albums {
        id
        title
        releaseYear
        
        # Get all songs in each album
        songs {
          id
          title
          genre
          spotifyUrl
          
          # Get all artists who performed this song (for collaborations)
          artists {
            id
            name
          }
        }
        
        # Get all artists who released this album (for collaborations)
        artists {
          id
          name
        }
      }
      
      # Get all songs directly performed by this artist
      songs {
        id
        title
        genre
        spotifyUrl
        
        # Get the album this song belongs to
        album {
          id
          title
        }
        
        # Get other artists who performed this song
        artists {
          id
          name
        }
      }
    }
    
    # Fetch all Albums to ensure we don't miss any
    albums {
      id
      title
      releaseYear
      
      # Artists who released this album
      artists {
        id
        name
      }
      
      # Songs in this album
      songs {
        id
        title
        genre
        
        # Artists who performed each song
        artists {
          id
          name
        }
      }
    }
    
    # Fetch all Songs to ensure complete coverage
    songs {
      id
      title
      genre
      spotifyUrl
      
      # Artists who performed this song
      artists {
        id
        name
      }
      
      # Album this song belongs to
      album {
        id
        title
      }
    }
  }
`;

// Utility function to transform GraphQL data into nodes and links for react-force-graph
export const transformDataForGraph = (data) => {
  const nodes = new Map();
  const links = [];

  // Helper function to add node if it doesn't exist
  const addNode = (id, type, data) => {
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        type, // 'artist', 'album', or 'song'
        ...data
      });
    }
  };

  // Helper function to add link if it doesn't exist
  const addLink = (source, target, type) => {
    const linkId = `${source}-${target}-${type}`;
    if (!links.find(link => link.id === linkId)) {
      links.push({
        id: linkId,
        source,
        target,
        type // 'RELEASED', 'PERFORMED', 'CONTAINS'
      });
    }
  };

  // Process artists
  if (data.artists) {
    data.artists.forEach(artist => {
      addNode(artist.id, 'artist', {
        name: artist.name,
        nationality: artist.nationality,
        spotifyUrl: artist.spotifyUrl
      });

      // Process artist's albums
      if (artist.albums) {
        artist.albums.forEach(album => {
          addNode(album.id, 'album', {
            title: album.title,
            releaseYear: album.releaseYear
          });
          
          // Add RELEASED relationship
          addLink(artist.id, album.id, 'RELEASED');

          // Process songs in each album
          if (album.songs) {
            album.songs.forEach(song => {
              addNode(song.id, 'song', {
                title: song.title,
                genre: song.genre,
                spotifyUrl: song.spotifyUrl
              });
              
              // Add CONTAINS relationship (album contains song)
              addLink(album.id, song.id, 'CONTAINS');

              // Add PERFORMED relationships for song artists
              if (song.artists) {
                song.artists.forEach(songArtist => {
                  addNode(songArtist.id, 'artist', {
                    name: songArtist.name
                  });
                  addLink(songArtist.id, song.id, 'PERFORMED');
                });
              }
            });
          }
        });
      }

      // Process artist's songs (direct relationship)
      if (artist.songs) {
        artist.songs.forEach(song => {
          addNode(song.id, 'song', {
            title: song.title,
            genre: song.genre,
            spotifyUrl: song.spotifyUrl
          });
          
          // Add PERFORMED relationship
          addLink(artist.id, song.id, 'PERFORMED');

          // Add album relationship if exists
          if (song.album && song.album.length > 0) {
            song.album.forEach(album => {
              addNode(album.id, 'album', {
                title: album.title
              });
              addLink(album.id, song.id, 'CONTAINS');
            });
          }
        });
      }
    });
  }

  // Process standalone albums (in case some aren't covered by artist queries)
  if (data.albums) {
    data.albums.forEach(album => {
      addNode(album.id, 'album', {
        title: album.title,
        releaseYear: album.releaseYear
      });

      // Process album artists
      if (album.artists) {
        album.artists.forEach(artist => {
          addNode(artist.id, 'artist', {
            name: artist.name
          });
          addLink(artist.id, album.id, 'RELEASED');
        });
      }

      // Process album songs
      if (album.songs) {
        album.songs.forEach(song => {
          addNode(song.id, 'song', {
            title: song.title,
            genre: song.genre
          });
          addLink(album.id, song.id, 'CONTAINS');

          // Process song artists
          if (song.artists) {
            song.artists.forEach(artist => {
              addNode(artist.id, 'artist', {
                name: artist.name
              });
              addLink(artist.id, song.id, 'PERFORMED');
            });
          }
        });
      }
    });
  }

  // Process standalone songs (in case some aren't covered)
  if (data.songs) {
    data.songs.forEach(song => {
      addNode(song.id, 'song', {
        title: song.title,
        genre: song.genre,
        spotifyUrl: song.spotifyUrl
      });

      // Process song artists
      if (song.artists) {
        song.artists.forEach(artist => {
          addNode(artist.id, 'artist', {
            name: artist.name
          });
          addLink(artist.id, song.id, 'PERFORMED');
        });
      }

      // Process song album
      if (song.album && song.album.length > 0) {
        song.album.forEach(album => {
          addNode(album.id, 'album', {
            title: album.title
          });
          addLink(album.id, song.id, 'CONTAINS');
        });
      }
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    links
  };
};