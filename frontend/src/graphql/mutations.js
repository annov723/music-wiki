import { gql } from '@apollo/client/core';

// Mutations for creating nodes
export const CREATE_ARTIST = gql`
  mutation CreateArtist($input: [ArtistCreateInput!]!) {
    createArtists(input: $input) {
      artists {
        id
        name
        nationality
        spotifyUrl
      }
    }
  }
`;

export const CREATE_ALBUM = gql`
  mutation CreateAlbum($input: [AlbumCreateInput!]!) {
    createAlbums(input: $input) {
      albums {
        id
        title
        releaseYear
      }
    }
  }
`;

export const CREATE_SONG = gql`
  mutation CreateSong($input: [SongCreateInput!]!) {
    createSongs(input: $input) {
      songs {
        id
        title
        genre
        spotifyUrl
      }
    }
  }
`;

// Mutations for updating nodes to create relationships
export const CONNECT_ARTIST_TO_ALBUM = gql`
  mutation ConnectArtistToAlbum($where: ArtistWhere, $connect: ArtistConnectInput) {
    updateArtists(where: $where, connect: $connect) {
      artists {
        id
        name
        albums {
          id
          title
        }
      }
    }
  }
`;

export const CONNECT_ARTIST_TO_SONG = gql`
  mutation ConnectArtistToSong($where: ArtistWhere, $connect: ArtistConnectInput) {
    updateArtists(where: $where, connect: $connect) {
      artists {
        id
        name
        songs {
          id
          title
        }
      }
    }
  }
`;

export const CONNECT_ALBUM_TO_SONG = gql`
  mutation ConnectAlbumToSong($where: AlbumWhere, $connect: AlbumConnectInput) {
    updateAlbums(where: $where, connect: $connect) {
      albums {
        id
        title
        songs {
          id
          title
        }
      }
    }
  }
`;

export const CONNECT_SONG_TO_ALBUM = gql`
  mutation ConnectSongToAlbum($where: SongWhere, $connect: SongConnectInput) {
    updateSongs(where: $where, connect: $connect) {
      songs {
        id
        title
        album {
          id
          title
        }
      }
    }
  }
`;

// Get all nodes for relationship dropdowns
export const GET_ALL_ARTISTS = gql`
  query GetAllArtists {
    artists {
      id
      name
    }
  }
`;

export const GET_ALL_ALBUMS = gql`
  query GetAllAlbums {
    albums {
      id
      title
    }
  }
`;

export const GET_ALL_SONGS = gql`
  query GetAllSongs {
    songs {
      id
      title
    }
  }
`;