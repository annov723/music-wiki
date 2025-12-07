import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import RelationshipButton from './RelationshipButton';
import RemoveRelationshipButton from './RemoveRelationshipButton';

const GraphCanvas = ({ graphData, onNodeClick, selectedNode, searchTerm = '' }) => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600
  });

  // Check if node matches search term
  const nodeMatchesSearch = (node) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    
    // Search in all node properties
    const searchableText = [
      node.name,
      node.title,
      node.label,
      node.genre,
      node.nationality,
      node.releaseYear,
      node.spotifyUrl
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    
    return searchableText.includes(search);
  };

  // Color scheme based on node group
  const getNodeColor = (node) => {
    // Dim non-matching nodes when searching
    const isMatch = nodeMatchesSearch(node);
    const alpha = searchTerm.trim() && !isMatch ? '40' : 'ff';
    
    switch (node.group) {
      case 1: // Artists
        return '#ff6b6b' + alpha;
      case 2: // Albums
        return '#4ecdc4' + alpha;
      case 3: // Songs
        return '#45b7d1' + alpha;
      default:
        return '#95a5a6' + alpha;
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
    const isMatch = nodeMatchesSearch(node);
    const sizeMultiplier = searchTerm.trim() && isMatch ? 1.5 : 1;
    
    switch (node.group) {
      case 1: // Artists
        return 8 * sizeMultiplier;
      case 2: // Albums
        return 6 * sizeMultiplier;
      case 3: // Songs
        return 4 * sizeMultiplier;
      default:
        return 3 * sizeMultiplier;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom to first matching node when searching
  useEffect(() => {
    if (searchTerm.trim() && fgRef.current && graphData.nodes.length > 0) {
      const matchingNode = graphData.nodes.find(node => nodeMatchesSearch(node));
      if (matchingNode) {
        fgRef.current.centerAt(matchingNode.x, matchingNode.y, 1000);
        fgRef.current.zoom(3, 1000);
      }
    }
  }, [searchTerm]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        minHeight: '400px'
      }}
    >
      <RelationshipButton />
      <RemoveRelationshipButton />
      
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

          // Draw border - highlight if selected
          const isSelected = selectedNode && selectedNode.id === node.id;
          ctx.strokeStyle = isSelected ? '#ffff00' : '#ffffff';
          ctx.lineWidth = isSelected ? 3 / globalScale : 1.5 / globalScale;
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
          if (onNodeClick) {
            onNodeClick(node);
          }
          // Gentle focus on clicked node without aggressive zoom
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 800);
            fgRef.current.zoom(Math.max(fgRef.current.zoom(), 1.5), 600);
          }
        }}
        
        // Enable node dragging
        onNodeDragEnd={(node) => {
          // Fix node position after drag
          node.fx = node.x;
          node.fy = node.y;
        }}
        
        onNodeHover={(node) => {
          // Change cursor on hover
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        
        // Physics settings - more stable
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        cooldownTicks={50}
        warmupTicks={50}
        
        // Background
        backgroundColor="#2c3e50"
        
        // Enable zoom and pan with better controls
        enableZoomPanInteraction={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        minZoom={0.1}
        maxZoom={8}
        
        // Control initial positioning
        onEngineStart={() => {
          // Set initial center position
          if (fgRef.current) {
            fgRef.current.centerAt(0, 0, 0);
          }
        }}
      />
    </div>
  );
};

export default GraphCanvas;