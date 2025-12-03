import React from 'react';

const InstructionsPanel = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      zIndex: 999,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>🎵 Music Wiki Graph</h4>
      <div style={{ marginBottom: '8px' }}>
        <strong>Graph Controls:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Click nodes to focus</li>
          <li>Mouse wheel to zoom</li>
          <li>Drag to pan</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Add Content:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
          <li>Use "Add Node" to create Artists, Albums, Songs</li>
          <li>Use "Add Relationship" to connect them</li>
        </ul>
      </div>

      <div>
        <strong>Schema Rules:</strong>
        <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '11px' }}>
          <li>Artists → RELEASED → Albums</li>
          <li>Artists → PERFORMED → Songs</li>
          <li>Albums → CONTAINS → Songs</li>
        </ul>
      </div>
    </div>
  );
};

export default InstructionsPanel;