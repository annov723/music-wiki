import { gql } from '@apollo/client/core';

export const GET_GRAPH_DATA = gql`
  query GetGraphData {
    artists {
      id
      name
      nationality
      spotifyUrl
      
      albums {
        id
        title
        releaseYear
        
        songs {
          id
          title
          genre
          spotifyUrl
          
          artists {
            id
            name
          }
        }
        
        artist {
          id
          name
        }
      }
      
      songs {
        id
        title
        genre
        spotifyUrl
        
        album {
          id
          title
        }
        
        artists {
          id
          name
        }
      }
    }
    
    albums {
      id
      title
      releaseYear
      
      artist {
        id
        name
      }
      
      songs {
        id
        title
        genre
        
        artists {
          id
          name
        }
      }
    }
    
    songs {
      id
      title
      genre
      spotifyUrl
      
      artists {
        id
        name
      }
      
      album {
        id
        title
      }
    }
  }
`;