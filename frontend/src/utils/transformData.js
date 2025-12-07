export const transformData = (data) => {
  const nodes = new Map();
  const links = [];

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

  const addLink = (source, target, type) => {
    const linkId = `${source}-${target}-${type}`;
    if (!links.find(link => link.id === linkId)) {
      links.push({
        id: linkId,
        source,
        target,
        type, 
        value: 1 
      });
    }
  };

  if (data.artists) {
    data.artists.forEach(artist => {
      addNode(artist.id, 'artist', {
        name: artist.name,
        nationality: artist.nationality,
        spotifyUrl: artist.spotifyUrl
      });

      if (artist.albums) {
        artist.albums.forEach(album => {
          addNode(album.id, 'album', {
            title: album.title,
            releaseYear: album.releaseYear
          });
          
          addLink(artist.id, album.id, 'RELEASED');

          if (album.songs) {
            album.songs.forEach(song => {
              addNode(song.id, 'song', {
                title: song.title,
                genre: song.genre,
                spotifyUrl: song.spotifyUrl
              });
              
              addLink(album.id, song.id, 'CONTAINS');

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

      if (artist.songs) {
        artist.songs.forEach(song => {
          addNode(song.id, 'song', {
            title: song.title,
            genre: song.genre,
            spotifyUrl: song.spotifyUrl
          });
          
          addLink(artist.id, song.id, 'PERFORMED');

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

  if (data.albums) {
    data.albums.forEach(album => {
      addNode(album.id, 'album', {
        title: album.title,
        releaseYear: album.releaseYear
      });

      if (album.artist && album.artist.length > 0) {
        const artist = album.artist[0]; 
        addNode(artist.id, 'artist', {
          name: artist.name
        });
        addLink(artist.id, album.id, 'RELEASED');
      }

      if (album.songs) {
        album.songs.forEach(song => {
          addNode(song.id, 'song', {
            title: song.title,
            genre: song.genre
          });
          addLink(album.id, song.id, 'CONTAINS');

          
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

  if (data.songs) {
    data.songs.forEach(song => {
      addNode(song.id, 'song', {
        title: song.title,
        genre: song.genre,
        spotifyUrl: song.spotifyUrl
      });

      if (song.artists) {
        song.artists.forEach(artist => {
          addNode(artist.id, 'artist', {
            name: artist.name
          });
          addLink(artist.id, song.id, 'PERFORMED');
        });
      }

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