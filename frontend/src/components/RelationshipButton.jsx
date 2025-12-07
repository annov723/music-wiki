import React, { useState } from 'react';
import AddRelationshipForm from './AddRelationshipForm';

const RelationshipButton = () => {
  const [showAddRelationship, setShowAddRelationship] = useState(false);

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 999
      }}>
        <button
          onClick={() => setShowAddRelationship(true)}
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
            width: '150px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          Dodaj krawędź
        </button>
      </div>

      {showAddRelationship && (
        <AddRelationshipForm
          onClose={() => setShowAddRelationship(false)}
          onRelationshipCreated={(result) => {
            console.log('Relationship created:', result);
          }}
        />
      )}
    </>
  );
};

export default RelationshipButton;