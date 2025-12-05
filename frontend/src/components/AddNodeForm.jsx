import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_ARTIST, CREATE_ALBUM, CREATE_SONG } from '../graphql/mutations';
import { GET_GRAPH_DATA } from '../graphql/queries';

const AddNodeForm = ({ onClose, onNodeCreated, embedded = false }) => {
  const [nodeType, setNodeType] = useState('artist');
  const [formData, setFormData] = useState({
    // Artist fields
    name: '',
    nationality: '',
    spotifyUrl: '',
    // Album fields
    title: '',
    releaseYear: '',
    // Song fields
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
    // Reset form data when changing node type
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

      // Reset form
      setFormData({
        name: '',
        nationality: '',
        spotifyUrl: '',
        title: '',
        releaseYear: '',
        genre: ''
      });

      alert(`${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} created successfully!`);
      
    } catch (error) {
      console.error('Error creating node:', error);
      alert(`Error creating ${nodeType}: ${error.message}`);
    }
  };

  const renderFormFields = () => {
    switch (nodeType) {
      case 'artist':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={inputStyleBase}
                placeholder="Enter artist name"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                style={inputStyleBase}
                placeholder="e.g., USA, UK, Canada"
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
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Enter album title"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Release Year
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="e.g., 2023"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </>
        );
        
      case 'song':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Enter song title"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="e.g., Rock, Pop, Jazz"
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

  const containerStyle = embedded ? {
    padding: '25px',
    height: '100%',
    backgroundColor: '#34495e',
    color: '#ecf0f1',
    overflow: 'auto'
  } : {
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
  };

  const formContainerStyle = embedded ? {
    width: '100%'
  } : {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  };

  const titleStyle = embedded ? {
    marginBottom: '20px',
    color: '#ecf0f1',
    fontSize: '20px'
  } : {
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333'
  };

  const inputStyleBase = embedded ? {
    width: '100%',
    padding: '10px',
    border: '1px solid #4a5a6a',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2c3e50',
    boxSizing: 'border-box'
  } : {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>
          Add New Node
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: embedded ? '#ecf0f1' : '#333' }}>
              Node Type *
            </label>
            <select
              value={nodeType}
              onChange={handleNodeTypeChange}
              style={{
                ...inputStyleBase,
                backgroundColor: embedded ? 'rgba(255, 255, 255, 0.95)' : '#f8f9fa'
              }}
            >
              <option value="artist">Artist</option>
              <option value="album">Album</option>
              <option value="song">Song</option>
            </select>
          </div>

          {renderFormFields()}

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '25px',
            justifyContent: embedded ? 'stretch' : 'flex-end'
          }}>
            {!embedded && onClose && (
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
            )}
            <button
              type="submit"
              style={{
                flex: embedded ? '1' : 'none',
                padding: '12px 20px',
                backgroundColor: embedded ? '#27ae60' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ➕ Create {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeForm;