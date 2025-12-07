import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { GET_GRAPH_DATA } from '../graphql/queries';

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
        const update = {};
        if (formData.name) update.name = { set: formData.name };
        if (formData.nationality) update.nationality = { set: formData.nationality };
        if (formData.spotifyUrl) update.spotifyUrl = { set: formData.spotifyUrl };
        
        result = await updateArtist({
          variables: {
            where: { id: { in: [node.id] } },
            update
          }
        });
      } else if (node.type === 'album') {
        const update = {};
        if (formData.title) update.title = { set: formData.title };
        if (formData.releaseYear) update.releaseYear = { set: parseInt(formData.releaseYear) };
        
        result = await updateAlbum({
          variables: {
            where: { id: { in: [node.id] } },
            update
          }
        });
      } else if (node.type === 'song') {
        const update = {};
        if (formData.title) update.title = { set: formData.title };
        if (formData.genre) update.genre = { set: formData.genre };
        if (formData.spotifyUrl) update.spotifyUrl = { set: formData.spotifyUrl };
        
        result = await updateSong({
          variables: {
            where: { id: { in: [node.id] } },
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
      alert(`Błąd podczas aktualizacji węzła ${node.type}: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Czy na pewno chcesz usunąć ten węzeł?`)) {
      return;
    }

    try {
      if (node.type === 'artist') {
        await deleteArtist({ variables: { where: { id: { in: [node.id] } } } });
      } else if (node.type === 'album') {
        await deleteAlbum({ variables: { where: { id: { in: [node.id] } } } });
      } else if (node.type === 'song') {
        await deleteSong({ variables: { where: { id: { in: [node.id] } } } });
      }

      alert(`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} usunięty.`);
      onClose();
      
    } catch (error) {
      console.error('Error deleting node:', error);
      alert(`Błąd podczas usuwania węzła ${node.type}: ${error.message}`);
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
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong style={{ color: '#ecf0f1' }}>Szczegóły:</strong>
          <div style={{ marginTop: '10px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
            {node.type === 'artist' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Nazwa:</strong> {formData.name || 'N/A'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Narodowość:</strong> {formData.nationality || 'N/A'}
                </div>
                <div>
                  <strong>Spotify URL:</strong> {formData.spotifyUrl ? (
                    <a href={formData.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954' }}>
                      Otwórz w Spotify
                    </a>
                  ) : 'N/A'}
                </div>
              </>
            )}
            {node.type === 'album' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Tytuł:</strong> {formData.title || 'N/A'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Rok wydania:</strong> {formData.releaseYear || 'N/A'}
                </div>
                <div>
                  <strong>Spotify URL:</strong> {formData.spotifyUrl ? (
                    <a href={formData.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954' }}>
                      Otwórz w Spotify
                    </a>
                  ) : 'N/A'}
                </div>
              </>
            )}
            {node.type === 'song' && (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Tytuł:</strong> {formData.title || 'N/A'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Gatunek:</strong> {formData.genre || 'N/A'}
                </div>
                <div>
                  <strong>Spotify URL:</strong> {formData.spotifyUrl ? (
                    <a href={formData.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1db954' }}>
                      Otwórz w Spotify
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
                Nazwa *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj nazwę artysty"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Narodowość
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Np. USA, UK, Kanada"
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
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>
          </>
        );
        
      case 'album':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Tytuł *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj tytuł albumu"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Rok wydania
              </label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear || ''}
                onChange={handleInputChange}
                style={inputStyle}
                max={new Date().getFullYear() + 1}
                placeholder="Np. 2023"
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
                placeholder="https://open.spotify.com/album/..."
              />
            </div>
          </>
        );
        
      case 'song':
        return (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Tytuł *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                required
                style={inputStyle}
                placeholder="Podaj tytuł piosenki"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#ecf0f1' }}>
                Gatunek
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre || ''}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Np. Rock, Pop, Jazz"
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
                placeholder="https://open.spotify.com/track/..."
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
          {isEditing ? 'Edytuj węzeł' : 'Dane węzła'}
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
              Edytuj
            </button>
            <button
              onClick={handleDelete}
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
              Usuń
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              onClick={handleSave}
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
              Zapisz
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...node });
                setIsEditing(false);
              }}
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
          </>
        )}
      </div>
    </div>
  );
};

export default EditNodeForm;