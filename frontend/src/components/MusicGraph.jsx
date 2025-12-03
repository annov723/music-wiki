import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_GRAPH_DATA } from '../graphql/queries';
import { transformData } from '../utils/transformData';
import GraphCanvas from './GraphCanvas.jsx';
import GraphToolbar from './GraphToolbar.jsx';
import InstructionsPanel from './InstructionsPanel.jsx';

const MusicGraph = () => {
  const { loading, error, data } = useQuery(GET_GRAPH_DATA);

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
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
      color: '#ff6b6b'
    }}>
      <h2>Error loading graph data</h2>
      <p>{error.message}</p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Make sure your GraphQL server is running at http://localhost:4000
      </p>
    </div>
  );

  // Transform the GraphQL data using the new utility function
  const graphData = transformData(data);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Stats Panel */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Music Wiki Graph</h3>
        <div><strong>Nodes:</strong> {graphData.nodes.length}</div>
        <div><strong>Links:</strong> {graphData.links.length}</div>
        <div style={{ marginTop: '10px' }}>
          <div><span style={{ color: '#ff6b6b' }}>●</span> Artists ({graphData.nodes.filter(n => n.group === 1).length})</div>
          <div><span style={{ color: '#4ecdc4' }}>●</span> Albums ({graphData.nodes.filter(n => n.group === 2).length})</div>
          <div><span style={{ color: '#45b7d1' }}>●</span> Songs ({graphData.nodes.filter(n => n.group === 3).length})</div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <div><span style={{ color: '#e74c3c' }}>—</span> Released</div>
          <div><span style={{ color: '#f39c12' }}>—</span> Performed</div>
          <div><span style={{ color: '#27ae60' }}>—</span> Contains</div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
          Click nodes to focus • Mouse wheel to zoom • Drag to pan
        </div>
      </div>

      {/* Graph Toolbar */}
      <GraphToolbar />

      {/* Instructions Panel */}
      <InstructionsPanel />

      {/* Graph Canvas */}
      <GraphCanvas graphData={graphData} />
    </div>
  );
};

export default MusicGraph;