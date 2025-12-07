import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  GET_ALL_ARTISTS, 
  GET_ALL_ALBUMS, 
  GET_ALL_SONGS,
  DISCONNECT_ARTIST_FROM_ALBUM,
  DISCONNECT_ARTIST_FROM_SONG,
  DISCONNECT_ALBUM_FROM_SONG,
  DISCONNECT_SONG_FROM_ALBUM
} from '../graphql/mutations';
import { GET_GRAPH_DATA } from '../graphql/queries';

const RemoveRelationshipForm = ({ onClose, onRelationshipRemoved }) => {
  const [relationshipType, setRelationshipType] = useState('RELEASED');
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');

  // Fetch all nodes
  const { data: artistsData } = useQuery(GET_ALL_ARTISTS);
  const { data: albumsData } = useQuery(GET_ALL_ALBUMS);
  const { data: songsData } = useQuery(GET_ALL_SONGS);

  // Disconnect mutations
  const [disconnectArtistFromAlbum] = useMutation(DISCONNECT_ARTIST_FROM_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [disconnectArtistFromSong] = useMutation(DISCONNECT_ARTIST_FROM_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [disconnectAlbumFromSong] = useMutation(DISCONNECT_ALBUM_FROM_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [disconnectSongFromAlbum] = useMutation(DISCONNECT_SONG_FROM_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });

  const getRelationshipRules = () => {
    return {
      'RELEASED': {
        label: 'Artist RELEASED Album',
        sourceType: 'artist',
        targetType: 'album',
        description: 'Remove connection between artist and album',
        icon: '🎵'
      },
      'PERFORMED': {
        label: 'Artist PERFORMED Song',
        sourceType: 'artist',
        targetType: 'song',
        description: 'Remove connection between artist and song',
        icon: '🎤'
      },
      'CONTAINS': {
        label: 'Album CONTAINS Song',
        sourceType: 'album',
        targetType: 'song',
        description: 'Remove song from album',
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

  // Filter target nodes to show only those connected to the selected source node
  const getFilteredTargetNodes = () => {
    const rules = getRelationshipRules()[relationshipType];
    const allTargets = getNodesForType(rules.targetType);
    
    if (!sourceNode) {
      return allTargets;
    }

    const sourceNodeData = getNodesForType(rules.sourceType).find(n => n.id === sourceNode);
    if (!sourceNodeData) {
      return allTargets;
    }

    // Filter based on relationship type
    switch (relationshipType) {
      case 'RELEASED': // Artist -> Album
        return sourceNodeData.albums || [];
      
      case 'PERFORMED': // Artist -> Song
        return sourceNodeData.songs || [];
      
      case 'CONTAINS': // Album -> Song
        return sourceNodeData.songs || [];
      
      default:
        return allTargets;
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

    try {
      let result;

      if (relationshipType === 'RELEASED') {
        // Artist -> Album
        result = await disconnectArtistFromAlbum({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              albums: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'PERFORMED') {
        // Artist -> Song
        result = await disconnectArtistFromSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'CONTAINS') {
        // Album -> Song (disconnect from both sides)
        result = await disconnectAlbumFromSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
        
        // Also disconnect from song to album
        await disconnectSongFromAlbum({
          variables: {
            where: { id: { in: [targetNode] } },
            update: {
              album: [{ disconnect: [{ where: { node: { id: { in: [sourceNode] } } } }] }]
            }
          }
        });
      }

      if (onRelationshipRemoved) {
        onRelationshipRemoved(result);
      }

      alert(`Relationship removed successfully!`);
      setSourceNode('');
      setTargetNode('');

    } catch (error) {
      console.error('Error removing relationship:', error);
      alert(`Error removing relationship: ${error.message}`);
    }
  };

  const rules = getRelationshipRules();
  const currentRule = rules[relationshipType];
  const sourceNodes = getNodesForType(currentRule.sourceType);
  const targetNodes = getFilteredTargetNodes();

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
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#d32f2f' }}>
          🗑️ Remove Relationship
        </h2>

        {/* Warning message */}
        <div style={{ 
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404',
          borderLeft: '4px solid #ffc107'
        }}>
          <strong>⚠️ Warning:</strong> This will permanently remove the connection between the selected nodes.
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
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              borderLeft: '4px solid #f44336'
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
              onChange={(e) => {
                setSourceNode(e.target.value);
                setTargetNode(''); // Clear target when source changes
              }}
              required
              style={inputStyle}
            >
              <option value="">Select {currentRule.sourceType}...</option>
              {sourceNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            textAlign: 'center', 
            margin: '15px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#d32f2f'
          }}>
            ❌ {relationshipType}
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
              disabled={!sourceNode || targetNodes.length === 0}
            >
              <option value="">
                {!sourceNode 
                  ? `Select ${currentRule.sourceType} first...` 
                  : targetNodes.length === 0 
                    ? `No connected ${currentRule.targetType}s found`
                    : `Select ${currentRule.targetType}...`
                }
              </option>
              {targetNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title}
                </option>
              ))}
            </select>
            {sourceNode && targetNodes.length === 0 && (
              <div style={{ 
                fontSize: '12px', 
                color: '#f57c00', 
                marginTop: '5px',
                padding: '8px',
                backgroundColor: '#fff3e0',
                borderRadius: '4px',
                borderLeft: '4px solid #ff9800'
              }}>
                ℹ️ No {currentRule.targetType}s are connected to this {currentRule.sourceType}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
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
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#d32f2f',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Remove Relationship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemoveRelationshipForm;
