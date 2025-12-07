import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_ALL_ARTISTS, 
  GET_ALL_ALBUMS, 
  GET_ALL_SONGS,
  CONNECT_ARTIST_TO_ALBUM,
  CONNECT_ARTIST_TO_SONG,
  CONNECT_ALBUM_TO_SONG,
  CONNECT_SONG_TO_ALBUM
} from '../graphql/mutations';
import { GET_GRAPH_DATA } from '../graphql/queries';

const AddRelationshipForm = ({ onClose, onRelationshipCreated }) => {
  const [relationshipType, setRelationshipType] = useState('RELEASED'); // RELEASED, PERFORMED, CONTAINS
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');

  // Fetch all nodes for dropdowns
  const { data: artistsData } = useQuery(GET_ALL_ARTISTS);
  const { data: albumsData } = useQuery(GET_ALL_ALBUMS);
  const { data: songsData } = useQuery(GET_ALL_SONGS);

  // Mutations
  const [connectArtistToAlbum] = useMutation(CONNECT_ARTIST_TO_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [connectArtistToSong] = useMutation(CONNECT_ARTIST_TO_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [connectAlbumToSong] = useMutation(CONNECT_ALBUM_TO_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [connectSongToAlbum] = useMutation(CONNECT_SONG_TO_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });

  const getRelationshipRules = () => {
    return {
      'RELEASED': {
        label: 'Artist RELEASED Album',
        sourceType: 'artist',
        targetType: 'album',
        description: 'Connect an artist to an album they released (Artist can have many albums)',
        icon: '🎵'
      },
      'PERFORMED': {
        label: 'Artist PERFORMED Song',
        sourceType: 'artist',
        targetType: 'song',
        description: 'Connect an artist to a song they performed (Song can have multiple artists)',
        icon: '🎤'
      },
      'CONTAINS': {
        label: 'Album CONTAINS Song',
        sourceType: 'album',
        targetType: 'song',
        description: 'Connect an album to a song it contains (Song belongs to one album)',
        icon: '💿'
      }
    };
  };

  const getNodesForType = (nodeType) => {
    switch (nodeType) {
      case 'artist':
        return artistsData?.artists || [];
      case 'album':
        return albumsData?.albums || [];
      case 'song':
        return songsData?.songs || [];
      default:
        return [];
    }
  };

  const handleRelationshipTypeChange = (e) => {
    setRelationshipType(e.target.value);
    setSourceNode('');
    setTargetNode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sourceNode || !targetNode) {
      alert('Please select both source and target nodes');
      return;
    }

    // Validation for CONTAINS relationship (Song can only belong to one album)
    if (relationshipType === 'CONTAINS') {
      const selectedSong = songsData?.songs?.find(s => s.id === targetNode);
      if (selectedSong && selectedSong.album && selectedSong.album.length > 0) {
        const currentAlbum = selectedSong.album[0];
        if (currentAlbum.id !== sourceNode) {
          alert(`This song is already in album "${currentAlbum.title}". A song can only belong to one album.`);
          return;
        }
      }
    }

    try {
      let result;
      const rules = getRelationshipRules();
      const rule = rules[relationshipType];

      if (relationshipType === 'RELEASED') {
        // Artist -> Album
        result = await connectArtistToAlbum({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              albums: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'PERFORMED') {
        // Artist -> Song
        result = await connectArtistToSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'CONTAINS') {
        // Album -> Song (connect from both sides)
        result = await connectAlbumToSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
        
        // Also connect from song to album (since song belongs to one album)
        await connectSongToAlbum({
          variables: {
            where: { id: { in: [targetNode] } },
            update: {
              album: [{ connect: [{ where: { node: { id: { in: [sourceNode] } } } }] }]
            }
          }
        });
      }

      if (onRelationshipCreated) {
        onRelationshipCreated(result);
      }

      alert(`Relationship created successfully!`);
      setSourceNode('');
      setTargetNode('');

    } catch (error) {
      console.error('Error creating relationship:', error);
      alert(`Error creating relationship: ${error.message}`);
    }
  };

  const rules = getRelationshipRules();
  const currentRule = rules[relationshipType];
  const sourceNodes = getNodesForType(currentRule.sourceType);
  const targetNodes = getNodesForType(currentRule.targetType);

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '450px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
          Create Relationship
        </h2>

        {/* Relationship Rules Summary */}
        <div style={{ 
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#495057'
        }}>
          <strong>Relationship Rules:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '18px' }}>
            <li>🎤 <strong>Artist</strong>: Can have many albums and many songs</li>
            <li>💿 <strong>Album</strong>: Can have many artists and many songs</li>
            <li>🎵 <strong>Song</strong>: Belongs to ONE album, can have many artists</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Relationship Type *
            </label>
            <select
              value={relationshipType}
              onChange={handleRelationshipTypeChange}
              style={{
                ...inputStyle,
                backgroundColor: '#f8f9fa'
              }}
            >
              {Object.entries(rules).map(([key, rule]) => (
                <option key={key} value={key}>
                  {rule.icon} {rule.label}
                </option>
              ))}
            </select>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '5px',
              padding: '8px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              borderLeft: '4px solid #2196f3'
            }}>
              💡 {currentRule.description}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Source ({currentRule.sourceType.charAt(0).toUpperCase() + currentRule.sourceType.slice(1)}) *
            </label>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select {currentRule.sourceType}...</option>
              {sourceNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title} (ID: {node.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            textAlign: 'center', 
            margin: '15px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#007bff'
          }}>
            {relationshipType}
            <div style={{ fontSize: '12px', color: '#666' }}>↓</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Target ({currentRule.targetType.charAt(0).toUpperCase() + currentRule.targetType.slice(1)}) *
            </label>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select {currentRule.targetType}...</option>
              {targetNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title} (ID: {node.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Schema Rules:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
              <li>Artists can RELEASE multiple Albums (collaboration albums)</li>
              <li>Artists can PERFORM multiple Songs (features, collaborations)</li>
              <li>Albums can CONTAIN multiple Songs</li>
              <li>Songs MUST belong to exactly one Album</li>
            </ul>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '25px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ccc',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Create Relationship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRelationshipForm;