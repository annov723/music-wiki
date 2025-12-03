import React, { useState } from 'react';
import AddNodeForm from './AddNodeForm';
import AddRelationshipForm from './AddRelationshipForm';

const GraphToolbar = () => {
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);

  const buttonStyle = {
    padding: '12px 18px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745'
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 999,
        display: 'flex',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <button
          style={buttonStyle}
          onClick={() => setShowAddNode(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          ➕ Add Node
        </button>
        
        <button
          style={secondaryButtonStyle}
          onClick={() => setShowAddRelationship(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          🔗 Add Relationship
        </button>
      </div>

      {showAddNode && (
        <AddNodeForm
          onClose={() => setShowAddNode(false)}
          onNodeCreated={(result) => {
            console.log('Node created:', result);
            // Keep form open for creating more nodes
            // setShowAddNode(false);
          }}
        />
      )}

      {showAddRelationship && (
        <AddRelationshipForm
          onClose={() => setShowAddRelationship(false)}
          onRelationshipCreated={(result) => {
            console.log('Relationship created:', result);
            // Keep form open for creating more relationships
            // setShowAddRelationship(false);
          }}
        />
      )}
    </>
  );
};

export default GraphToolbar;