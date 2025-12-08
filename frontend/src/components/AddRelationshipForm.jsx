import { useState } from 'react';
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
  const [relationshipType, setRelationshipType] = useState('RELEASED');
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');

  const { data: artistsData } = useQuery(GET_ALL_ARTISTS);
  const { data: albumsData } = useQuery(GET_ALL_ALBUMS);
  const { data: songsData } = useQuery(GET_ALL_SONGS);

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

    if (relationshipType === 'RELEASED') {
      const selectedAlbum = albumsData?.albums?.find(a => a.id === targetNode);
      if (selectedAlbum && selectedAlbum.artist && selectedAlbum.artist.length > 0) {
        const currentArtist = selectedAlbum.artist[0];
        if (currentArtist.id !== sourceNode) {
          alert(`Ten album już ma twórcę: ${currentArtist.name}. Album może mieć tylko 1 twórcę.`);
          return;
        }
      }
    }

    if (relationshipType === 'CONTAINS') {
      const selectedSong = songsData?.songs?.find(s => s.id === targetNode);
      if (selectedSong && selectedSong.album && selectedSong.album.length > 0) {
        const currentAlbum = selectedSong.album[0];
        if (currentAlbum.id !== sourceNode) {
          alert(`Ta piosenka jest już w albumie": ${currentAlbum.title}. Piosenka może należeć tylko do jednego albumu.`);
          return;
        }
      }
    }

    try {
      let result;
      const rules = getRelationshipRules();
      const rule = rules[relationshipType];

      if (relationshipType === 'RELEASED') {
        result = await connectArtistToAlbum({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              albums: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'PERFORMED') {
        result = await connectArtistToSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
      } else if (relationshipType === 'CONTAINS') {
        result = await connectAlbumToSong({
          variables: {
            where: { id: { in: [sourceNode] } },
            update: {
              songs: [{ connect: [{ where: { node: { id: { in: [targetNode] } } } }] }]
            }
          }
        });
        
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

      alert(`Krawędź dodana.`);
      setSourceNode('');
      setTargetNode('');

    } catch (error) {
      console.error('Error creating relationship:', error);
      alert(`Błąd podczas usuwania krawędzi: ${error.message}`);
    }
  };

  const rules = getRelationshipRules();
  const currentRule = rules[relationshipType];
  const sourceNodes = getNodesForType(currentRule.sourceType);
  const targetNodes = getNodesForType(currentRule.targetType);

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
          Dodaj krawędź
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
              Węzeł źródłowy ({currentRule.sourcePl}) *
            </label>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Wybierz węzeł...</option>
              {sourceNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title} (ID: {node.id})
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
            >
              <option value="">Wybierz węzeł...</option>
              {targetNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name || node.title} (ID: {node.id})
                </option>
              ))}
            </select>
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
              Utwórz krawędź
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRelationshipForm;