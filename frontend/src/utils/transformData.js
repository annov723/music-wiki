// Utility function to transform GraphQL data into nodes and links for force graph
export const transformData = (data) => {
  const nodes = new Map();
  const links = [];

  // Helper function to add node if it doesn't exist
  const addNode = (id, type, nodeData) => {
    if (!nodes.has(id)) {
      let group;
      switch (type) {
        case 'artist':
          group = 1;
          break;
        case 'album':
          group = 2;
          break;
        case 'song':
          group = 3;
          break;
        default:
          group = 0;
      }

      nodes.set(id, {
        id,
        type,
        group,
        name: nodeData.name || nodeData.title || `${type}-${id}`,
        ...nodeData
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
        type, // 'RELEASED', 'PERFORMED', 'CONTAINS'
        value: 1 // For link thickness
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

  // Process standalone albums
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

  // Process standalone songs
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