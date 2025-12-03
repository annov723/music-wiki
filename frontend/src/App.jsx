import React, { useState } from 'react';
import GraphCanvas from './components/GraphCanvas.jsx';
import GraphToolbar from './components/GraphToolbar.jsx';
import InstructionsPanel from './components/InstructionsPanel.jsx';
import AddNodeForm from './components/AddNodeForm.jsx';
import EditNodeForm from './components/EditNodeForm.jsx';
import { useQuery } from '@apollo/client';
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
      Loading music graph...
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
      <h2>Error loading graph data</h2>
      <p>{error.message}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Make sure your GraphQL server is running at http://localhost:4000
      </p>
    </div>
  );

  const graphData = transformData(data);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎵 Music Wiki</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search artists, albums, songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="app-body">
        {/* Left Panel - Graph */}
        <div className="graph-panel">
          {/* Graph Stats */}
          <div className="graph-stats">
            <div className="stats-content">
              <div><strong>Nodes:</strong> {graphData.nodes.length}</div>
              <div><strong>Links:</strong> {graphData.links.length}</div>
              <div className="node-types">
                <span><span className="color-dot artist">●</span> Artists ({graphData.nodes.filter(n => n.group === 1).length})</span>
                <span><span className="color-dot album">●</span> Albums ({graphData.nodes.filter(n => n.group === 2).length})</span>
                <span><span className="color-dot song">●</span> Songs ({graphData.nodes.filter(n => n.group === 3).length})</span>
              </div>
            </div>
          </div>

          {/* Instructions Panel */}
          <InstructionsPanel />

          {/* Graph Canvas */}
          <GraphCanvas 
            graphData={graphData} 
            onNodeClick={setSelectedNode}
            selectedNode={selectedNode}
          />
        </div>

        {/* Right Panel - Sidebar */}
        <div className="sidebar-panel">
          <div className="sidebar-content">
            {selectedNode ? (
              <EditNodeForm 
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onNodeUpdated={() => {
                  // Handle node update
                  console.log('Node updated');
                }}
              />
            ) : (
              <div className="add-node-container">
                <AddNodeForm 
                  embedded={true}
                  onNodeCreated={(result) => {
                    console.log('Node created:', result);
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
