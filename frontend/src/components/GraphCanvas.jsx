import { useRef, useEffect, useState } from 'react';
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

  const nodeMatchesSearch = (node) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    
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

  const getNodeColor = (node) => {
    const isMatch = nodeMatchesSearch(node);
    const alpha = searchTerm.trim() && !isMatch ? '40' : 'ff';
    
    switch (node.group) {
      case 1: 
        return '#ff6b6b' + alpha;
      case 2: 
        return '#4ecdc4' + alpha;
      case 3: 
        return '#45b7d1' + alpha;
      default:
        return '#95a5a6' + alpha;
    }
  };

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

  const getNodeSize = (node) => {
    const isMatch = nodeMatchesSearch(node);
    const sizeMultiplier = searchTerm.trim() && isMatch ? 1.5 : 1;
    
    switch (node.group) {
      case 1: 
        return 8 * sizeMultiplier;
      case 2: 
        return 6 * sizeMultiplier;
      case 3: 
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
        
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || node.title || `${node.type}-${node.id}`;
          const fontSize = 12 / globalScale;
          const nodeSize = getNodeSize(node);

          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();

          const isSelected = selectedNode && selectedNode.id === node.id;
          ctx.strokeStyle = isSelected ? '#ffff00' : '#ffffff';
          ctx.lineWidth = isSelected ? 3 / globalScale : 1.5 / globalScale;
          ctx.stroke();

          if (globalScale > 1) { 
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
        
        linkColor={getLinkColor}
        linkWidth={2}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        
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
          if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 800);
            fgRef.current.zoom(Math.max(fgRef.current.zoom(), 1.5), 600);
          }
        }}
        
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
        
        onNodeHover={(node) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
        }}
        
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.4}
        cooldownTicks={50}
        warmupTicks={50}
        
        backgroundColor="#2c3e50"
        
        enableZoomPanInteraction={true}
        enablePanInteraction={true}
        enableZoomInteraction={true}
        minZoom={0.1}
        maxZoom={8}
        
        onEngineStart={() => {
          if (fgRef.current) {
            fgRef.current.centerAt(0, 0, 0);
          }
        }}
      />
    </div>
  );
};

export default GraphCanvas;