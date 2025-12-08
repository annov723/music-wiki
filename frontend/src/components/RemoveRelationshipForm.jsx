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

  const { data: artistsData } = useQuery(GET_ALL_ARTISTS);
  const { data: albumsData } = useQuery(GET_ALL_ALBUMS);
  const { data: songsData } = useQuery(GET_ALL_SONGS);

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
        label: 'artysta wydał album',
        sourceType: 'artist',
        targetType: 'album',
        sourcePl: 'artysta',
        targetPl: 'album'
      },
      'PERFORMED': {
        label: 'artysta wydał piosenkę',
        sourceType: 'artist',
        targetType: 'song',
        sourcePl: 'artysta',
        targetPl: 'piosenka'
      },
      'CONTAINS': {
        label: 'album zawiera piosenkę',
        sourceType: 'album',
        targetType: 'song',
        sourcePl: 'album',
        targetPl: 'piosenka'
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

    switch (relationshipType) {
      case 'RELEASED': 
        return sourceNodeData.albums || [];
      
      case 'PERFORMED': 
        return sourceNodeData.songs || [];
      
      case 'CONTAINS': 
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
      alert('Należy wybrać oba węzły połączone krawędzią.');
      return;
    }

    try {
      let result;

      if (relationshipType === 'RELEASED') {
        result = await disconnectArtistFromAlbum({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              albums: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'PERFORMED') {
        result = await disconnectArtistFromSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'CONTAINS') {
        result = await disconnectAlbumFromSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ disconnect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
        
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

      alert(`Krawędź usunięta.`);
      setSourceNode('');
      setTargetNode('');

    } catch (error) {
      console.error('Error removing relationship:', error);
      alert(`Błąd podczas usuwania krawędzi: ${error.message}`);
    }
  };

  const rules = getRelationshipRules();
  const currentRule = rules[relationshipType];
  const sourceNodes = getNodesForType(currentRule.sourceType);
  const targetNodes = getFilteredTargetNodes();

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #4a5a6a',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2c3e50',
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
        backgroundColor: '#2c3e50',
        padding: '30px',
        borderRadius: '8px',
        width: '450px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
          Usuń krawędź
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Typ relacji *
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
                  {rule.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Węzeł żródłowy ({currentRule.sourcePl}) *
            </label>
            <select
              value={sourceNode}
              onChange={(e) => {
                setSourceNode(e.target.value);
                setTargetNode(''); 
              }}
              required
              style={inputStyle}
            >
              <option value="">Wybierz węzeł...</option>
              {sourceNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Węzeł docelowy ({currentRule.targetPl}) *
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
                  ? `Wybierz węzeł źródłowy jako pierwszy...` 
                  : targetNodes.length === 0 
                    ? `Brak połączonych węzłów`
                    : `Wybierz węzeł...`
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
                Brak krawędzi pomiędzy wybranymi węzłami.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 18px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.2s',
                width: '48%'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c62828'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
            >
              Anuluj
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 18px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.2s',
                width: '48%'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Usuń krawędź
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemoveRelationshipForm;
