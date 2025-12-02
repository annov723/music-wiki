import React from 'react';
import { useQuery } from '@apollo/client';
import ForceGraph2D from 'react-force-graph-2d';
import { GET_GRAPH_DATA, transformDataForGraph } from '../graphql/queries';

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

  // Transform the GraphQL data into nodes and links
  const graphData = transformDataForGraph(data);

  // Node styling based on type
  const getNodeColor = (node) => {
    switch (node.type) {
      case 'artist':
        return '#ff6b6b'; // Red for artists
      case 'album':
        return '#4ecdc4'; // Teal for albums
      case 'song':
        return '#45b7d1'; // Blue for songs
      default:
        return '#95a5a6'; // Gray fallback
    }
  };

  // Link styling based on relationship type
  const getLinkColor = (link) => {
    switch (link.type) {
      case 'RELEASED':
        return '#e74c3c'; // Red for released
      case 'PERFORMED':
        return '#f39c12'; // Orange for performed
      case 'CONTAINS':
        return '#27ae60'; // Green for contains
      default:
        return '#bdc3c7'; // Gray fallback
    }
  };

  const getNodeLabel = (node) => {
    switch (node.type) {
      case 'artist':
        return node.name;
      case 'album':
        return node.title;
      case 'song':
        return node.title;
      default:
        return node.id;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#2c3e50' }}>
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
          <div><span style={{ color: '#ff6b6b' }}>●</span> Artists ({graphData.nodes.filter(n => n.type === 'artist').length})</div>
          <div><span style={{ color: '#4ecdc4' }}>●</span> Albums ({graphData.nodes.filter(n => n.type === 'album').length})</div>
          <div><span style={{ color: '#45b7d1' }}>●</span> Songs ({graphData.nodes.filter(n => n.type === 'song').length})</div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px' }}>
          <div><span style={{ color: '#e74c3c' }}>—</span> Released</div>
          <div><span style={{ color: '#f39c12' }}>—</span> Performed</div>
          <div><span style={{ color: '#27ae60' }}>—</span> Contains</div>
        </div>
      </div>

      <ForceGraph2D
        graphData={graphData}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = getNodeLabel(node);
          const fontSize = 12 / globalScale;
          const nodeRadius = Math.max(4, fontSize * 0.6);

          // Draw node
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          // Draw border
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();

          // Draw label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.font = `${fontSize}px Arial`;
          ctx.fillText(label, node.x, node.y + nodeRadius + fontSize);
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={getLinkColor}
        linkWidth={1.5}
        backgroundColor="#2c3e50"
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          const radius = Math.max(4, 12 * 0.6);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={(node) => {
          console.log('Clicked node:', node);
          // You can add node details modal here later
        }}
        cooldownTicks={100}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
      />
    </div>
  );
};

export default MusicGraph;