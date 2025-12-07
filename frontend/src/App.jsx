import React, { useState } from 'react';
import GraphCanvas from './components/GraphCanvas.jsx';
import InstructionsPanel from './components/InstructionsPanel.jsx';
import AddNodeForm from './components/AddNodeForm.jsx';
import EditNodeForm from './components/EditNodeForm.jsx';
import { useQuery } from '@apollo/client/react';
import { GET_GRAPH_DATA } from './graphql/queries';
import { transformData } from './utils/transformData';
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { loading, error, data } = useQuery(GET_GRAPH_DATA);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      backgroundColor: '#2c3e50',
      color: 'white'
    }}>
      Ładowanie grafu...
    </div>
  );

  if (error) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      color: '#ff6b6b',
      backgroundColor: '#2c3e50'
    }}>
      <h2>Błąd podczas ładowania grafu</h2>
      <p>{error.message}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Upewnij się, że serwer działa pod adresem http://localhost:4000
      </p>
    </div>
  );

  const graphData = transformData(data);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎵 Music Wiki</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Wyszukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      <div className="app-body">
        <div className="graph-panel">
          <div className="graph-stats">
            <div className="stats-content">
              <div><strong>Węzły:</strong> {graphData.nodes.length}</div>
              <div><strong>Krawędzie:</strong> {graphData.links.length}</div>
              <div className="node-types">
                <span><span className="color-dot artist">●</span> artyści ({graphData.nodes.filter(n => n.group === 1).length})</span>
                <span><span className="color-dot album">●</span> albumy ({graphData.nodes.filter(n => n.group === 2).length})</span>
                <span><span className="color-dot song">●</span> piosenki ({graphData.nodes.filter(n => n.group === 3).length})</span>
              </div>
            </div>
          </div>

          <InstructionsPanel />

          <GraphCanvas 
            graphData={graphData} 
            onNodeClick={setSelectedNode}
            selectedNode={selectedNode}
            searchTerm={searchTerm}
          />
        </div>

        <div className="sidebar-panel">
          <div className="sidebar-content">
            {selectedNode ? (
              <EditNodeForm 
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onNodeUpdated={() => {
                  console.log('Węzeł zaktualizowany');
                }}
              />
            ) : (
              <div className="add-node-container">
                <AddNodeForm
                  onNodeCreated={(result) => {
                    console.log('Węzeł utworzony:', result);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
