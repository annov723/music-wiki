import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { GET_GRAPH_DATA } from '../graphql/queries';

// Update mutations for each node type
const UPDATE_ARTIST = gql`
  mutation UpdateArtist($where: ArtistWhere, $update: ArtistUpdateInput) {
    updateArtists(where: $where, update: $update) {
      artists {
        id
        name
        nationality
        spotifyUrl
      }
    }
  }
`;

const UPDATE_ALBUM = gql`
  mutation UpdateAlbum($where: AlbumWhere, $update: AlbumUpdateInput) {
    updateAlbums(where: $where, update: $update) {
      albums {
        id
        title
        releaseYear
      }
    }
  }
`;

const UPDATE_SONG = gql`
  mutation UpdateSong($where: SongWhere, $update: SongUpdateInput) {
    updateSongs(where: $where, update: $update) {
      songs {
        id
        title
        genre
        spotifyUrl
      }
    }
  }
`;

// Delete mutations
const DELETE_ARTIST = gql`
  mutation DeleteArtist($where: ArtistWhere) {
    deleteArtists(where: $where) {
      nodesDeleted
    }
  }
`;

const DELETE_ALBUM = gql`
  mutation DeleteAlbum($where: AlbumWhere) {
    deleteAlbums(where: $where) {
      nodesDeleted
    }
  }
`;

const DELETE_SONG = gql`
  mutation DeleteSong($where: SongWhere) {
    deleteSongs(where: $where) {
      nodesDeleted
    }
  }
`;

const EditNodeForm = ({ node, onClose, onNodeUpdated }) => {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Mutations
  const [updateArtist] = useMutation(UPDATE_ARTIST, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [updateAlbum] = useMutation(UPDATE_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [updateSong] = useMutation(UPDATE_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });

  const [deleteArtist] = useMutation(DELETE_ARTIST, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [deleteAlbum] = useMutation(DELETE_ALBUM, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });
  const [deleteSong] = useMutation(DELETE_SONG, {
    refetchQueries: [{ query: GET_GRAPH_DATA }]
  });

  useEffect(() => {
    if (node) {
      setFormData({ ...node });
      setIsEditing(false);
    }
  }, [node]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (node.type === 'artist') {
        const update = {
          name: formData.name,
          nationality: formData.nationality || null,
          spotifyUrl: formData.spotifyUrl || null
        };
        result = await updateArtist({
          variables: {
            where: { id: node.id },
            update
          }
        });
      } else if (node.type === 'album') {
        const update = {
          title: formData.title,
          releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null
        };
        result = await updateAlbum({
          variables: {
            where: { id: node.id },
            update
          }
        });
      } else if (node.type === 'song') {
        const update = {
          title: formData.title,
          genre: formData.genre || null,
          spotifyUrl: formData.spotifyUrl || null
        };
        result = await updateSong({
          variables: {
            where: { id: node.id },
            update
          }
        });
      }

      if (onNodeUpdated) {
        onNodeUpdated(result);
      }

      setIsEditing(false);
      alert(`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} updated successfully!`);
      
    } catch (error) {
      console.error('Error updating node:', error);
      alert(`Error updating ${node.type}: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${node.type}?`)) {
      return;
    }

    try {
      if (node.type === 'artist') {
        await deleteArtist({ variables: { where: { id: node.id } } });
      } else if (node.type === 'album') {
        await deleteAlbum({ variables: { where: { id: node.id } } });
      } else if (node.type === 'song') {
        await deleteSong({ variables: { where: { id: node.id } } });
      }

      alert(`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} deleted successfully!`);
      onClose();
      
    } catch (error) {
      console.error('Error deleting node:', error);
      alert(`Error deleting ${node.type}: ${error.message}`);
    }
  };

  const renderViewMode = () => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'artist': return '#ff6b6b';
        case 'album': return '#4ecdc4';
        case 'song': return '#45b7d1';
        default: return '#95a5a6';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'artist': return '🎤';
        case 'album': return '💿';
        case 'song': return '🎵';
        default: return '📄';
      }
    };

    return (
      <>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: getTypeColor(node.type),
          borderRadius: '8px',
          color: 'white'
        }}>
          <span style={{ fontSize: '24px' }}>{getTypeIcon(node.type)}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              {formData.name || formData.title}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong style={{ color: '#ecf0f1' }}>Details:</strong>
          <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
            {node.type === 'artist' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Name:</strong> {formData.name || 'N/A'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Nationality:</strong> {formData.nationality || 'N/A'}
                </div>
                <div>
                  <strong>Spotify URL:</strong> {formData.spotifyUrl ? (
                    <a href={formData.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954' }}>
                      Open in Spotify
                    </a>
                  ) : 'N/A'}
                </div>
              </>
            )}
            {node.type === 'album' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Title:</strong> {formData.title || 'N/A'}
                </div>
                <div>
                  <strong>Release Year:</strong> {formData.releaseYear || 'N/A'}
                </div>
              </>
            )}
            {node.type === 'song' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Title:</strong> {formData.title || 'N/A'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Genre:</strong> {formData.genre || 'N/A'}
                </div>
                <div>
                  <strong>Spotify URL:</strong> {formData.spotifyUrl ? (
                    <a href={formData.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954' }}>
                      Open in Spotify
                    </a>
                  ) : 'N/A'}
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderEditFields = () => {
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

    switch (node.type) {
      case 'artist':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotifyUrl"
                value={formData.spotifyUrl || ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </>
        );
        
      case 'album':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Release Year
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear || ''}
                onChange={handleInputChange}
                style={inputStyle}
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre || ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Spotify URL
              </label>
              <input
                type="url"
                name="spotifyUrl"
                value={formData.spotifyUrl || ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  if (!node) {
    return null;
  }

  return (
    <div style={{
      padding: '25px',
      height: '100%',
      color: '#ecf0f1',
      backgroundColor: '#34495e',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>
          {isEditing ? 'Edit Node' : 'Node Inspector'}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ecf0f1',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {!isEditing ? renderViewMode() : (
        <form onSubmit={handleSave}>
          {renderEditFields()}
        </form>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '25px',
        flexWrap: 'wrap'
      }}>
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🗑️ Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              💾 Save
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...node });
                setIsEditing(false);
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ❌ Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditNodeForm;