import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphCanvas = ({ graphData }) => {
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Auto-resize functionality
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-fit graph on data change
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Auto-zoom to fit all nodes
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 20);
      }, 100);
    }
  }, [graphData]);

  // Color scheme based on node group
  const getNodeColor = (node) => {
    switch (node.group) {
      case 1: // Artists
        return '#ff6b6b';
      case 2: // Albums
        return '#4ecdc4';
      case 3: // Songs
        return '#45b7d1';
      default:
        return '#95a5a6';
    }
  };

  // Link color based on relationship type
  const getLinkColor = (link) => {
    switch (link.type) {
      case 'RELEASED':
        return '#e74c3c';
      case 'PERFORMED':
        return '#f39c12';
      case 'CONTAINS':
        return '#27ae60';
      default:
        return '#bdc3c7';
    }
  };

  // Node size based on type
  const getNodeSize = (node) => {
    switch (node.group) {
      case 1: // Artists
        return 8;
      case 2: // Albums
        return 6;
      case 3: // Songs
        return 4;
      default:
        return 3;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        
        // Node styling
        nodeRelSize={getNodeSize}
        nodeColor={getNodeColor}
        nodeLabel={(node) => {
          const label = node.name || node.title || `${node.type}-${node.id}`;
          const details = [];
          
          if (node.type === 'artist' && node.nationality) {
            details.push(`Nationality: ${node.nationality}`);
          }
          if (node.type === 'album' && node.releaseYear) {
            details.push(`Released: ${node.releaseYear}`);
          }
          if (node.type === 'song' && node.genre) {
            details.push(`Genre: ${node.genre}`);
          }
          
          return `${label}${details.length > 0 ? '\n' + details.join('\n') : ''}`;
        }}
        
        // Node canvas rendering with labels
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || node.title || `${node.type}-${node.id}`;
          const fontSize = 12 / globalScale;
          const nodeSize = getNodeSize(node);

          // Draw node
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          // Draw border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5 / globalScale;
          ctx.stroke();

          // Draw label
          if (globalScale > 1) { // Only show labels when zoomed in enough
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.font = `${fontSize}px Arial`;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 2;
            ctx.fillText(label, node.x, node.y + nodeSize + fontSize + 2);
            ctx.shadowColor = 'transparent';
          }
        }}
        
        // Link styling
        linkColor={getLinkColor}
        linkWidth={2}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        
        // Interaction
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, getNodeSize(node) + 2, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        
        onNodeClick={(node) => {
          console.log('Clicked node:', node);
          // Focus on clicked node
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(3, 1000);
          }
        }}
        
        onNodeHover={(node) => {
          // Change cursor on hover
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        
        // Physics settings
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        cooldownTicks={100}
        warmupTicks={100}
        
        // Background
        backgroundColor="#2c3e50"
        
        // Enable zoom and pan
        enableZoomPanInteraction={true}
        minZoom={0.1}
        maxZoom={10}
      />
    </div>
  );
};

export default GraphCanvas;