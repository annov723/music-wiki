import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_ARTIST, CREATE_ALBUM, CREATE_SONG } from '../graphql/mutations';
import { GET_GRAPH_DATA } from '../graphql/queries';

const AddNodeForm = ({ onNodeCreated }) => {
  const [nodeType, setNodeType] = useState('artist');
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    spotifyUrl: '',
    title: '',
    releaseYear: '',
    genre: ''
  });

  const [createArtist] = useMutation(CREATE_ARTIST, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [createAlbum] = useMutation(CREATE_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [createSong] = useMutation(CREATE_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNodeTypeChange = (e) => {
    setNodeType(e.target.value);
    setFormData({
      name: '',
      nationality: '',
      spotifyUrl: '',
      title: '',
      releaseYear: '',
      genre: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (nodeType === 'artist') {
        const input = {
          name: formData.name,
          nationality: formData.nationality || null,
          spotifyUrl: formData.spotifyUrl || null
        };
        result = await createArtist({ variables: { input: [input] } });
        
      } else if (nodeType === 'album') {
        const input = {
          title: formData.title,
          releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null
        };
        result = await createAlbum({ variables: { input: [input] } });
        
      } else if (nodeType === 'song') {
        const input = {
          title: formData.title,
          genre: formData.genre || null,
          spotifyUrl: formData.spotifyUrl || null
        };
        result = await createSong({ variables: { input: [input] } });
      }

      if (onNodeCreated) {
        onNodeCreated(result);
      }

      setFormData({
        name: '',
        nationality: '',
        spotifyUrl: '',
        title: '',
        releaseYear: '',
        genre: ''
      });

      alert(`Węzeł ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} utworzony.`);
      
    } catch (error) {
      alert(`Błąd podczas tworzenia  węzła${nodeType}: ${error.message}`);
    }
  };

  const renderFormFields = () => {
    switch (nodeType) {
      case 'artist':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nazwa *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj nazwę artysty"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Narodowość
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Np. USA, UK, Kanada"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotifyUrl"
                value={formData.spotifyUrl}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
          </>
        );
        
      case 'album':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tytuł *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj tytuł albumu"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Rok wydania
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Np. 2023"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotifyUrl"
                value={formData.spotifyUrl}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://open.spotify.com/album/..."
              />
            </div>
          </>
        );
        
      case 'song':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tytuł *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj tytuł piosenki"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Gatunek
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Np. Rock, Pop, Jazz"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotifyUrl"
                value={formData.spotifyUrl}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://open.spotify.com/track/..."
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const containerStyle = {
    padding: '25px',
    height: '100%',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    overflow: 'auto'
  };

  const formContainerStyle = {
    width: '100%'
  };

  const titleStyle = {
    marginBottom: '20px',
    color: '#ecf0f1',
    fontSize: '20px'
  };

  const inputStyleBase = {
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
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>
          Utwórz nowy węzeł
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
              Typ węzła *
            </label>
            <select
              value={nodeType}
              onChange={handleNodeTypeChange}
              style={{
                ...inputStyleBase,
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <option value="artist">Artysta</option>
              <option value="album">Album</option>
              <option value="song">Piosenka</option>
            </select>
          </div>

          {renderFormFields()}

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '25px',
            justifyContent: 'stretch'
          }}>
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
                flex: 1
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Utwórz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeForm;