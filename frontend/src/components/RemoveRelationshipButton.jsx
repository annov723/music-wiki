import { useState } from 'react';
import RemoveRelationshipForm from './RemoveRelationshipForm';

const RemoveRelationshipButton = () => {
  const [showRemoveRelationship, setShowRemoveRelationship] = useState(false);

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 65,
        right: 15,
        zIndex: 999
      }}>
        <button
          onClick={() => setShowRemoveRelationship(true)}
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
            width: '150px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c62828'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#d32f2f'}
        >
          Usuń krawędź
        </button>
      </div>

      {showRemoveRelationship && (
        <RemoveRelationshipForm
          onClose={() => setShowRemoveRelationship(false)}
          onRelationshipRemoved={(result) => {
            console.log('Krawędź usunięta:', result);
          }}
        />
      )}
    </>
  );
};

export default RemoveRelationshipButton;
