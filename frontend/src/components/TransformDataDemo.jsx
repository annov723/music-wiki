import React from 'react';
import { transformData } from '../utils/transformData';

// Example demo data to showcase the transformData function
const demoData = {
  artists: [
    {
      id: "1",
      name: "The Beatles",
      nationality: "UK",
      albums: [
        {
          id: "1",
          title: "Abbey Road",
          releaseYear: 1969,
          songs: [
            {
              id: "1",
              title: "Come Together",
              genre: "Rock",
              artists: [{ id: "1", name: "The Beatles" }]
            }
          ]
        }
      ],
      songs: [
        {
          id: "1",
          title: "Come Together",
          genre: "Rock",
          album: [{ id: "1", title: "Abbey Road" }]
        }
      ]
    }
  ],
  albums: [],
  songs: []
};

const TransformDataDemo = () => {
  const transformedData = transformData(demoData);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Transform Data Function Demo</h2>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <h3>Input Data (GraphQL Response)</h3>
          <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(demoData, null, 2)}
          </pre>
        </div>
        
        <div style={{ flex: 1, background: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
          <h3>Output (Graph Format)</h3>
          <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(transformedData, null, 2)}
          </pre>
        </div>
      </div>

      <div style={{ marginTop: '20px', background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h4>Key Features of transformData():</h4>
        <ul>
          <li><strong>Group Property:</strong> Nodes have a `group` property (1=Artist, 2=Album, 3=Song) for color coding</li>
          <li><strong>Name Property:</strong> All nodes have a standardized `name` property for labels</li>
          <li><strong>Deduplication:</strong> Prevents duplicate nodes and links</li>
          <li><strong>Relationships:</strong> Links have type property ('RELEASED', 'PERFORMED', 'CONTAINS')</li>
          <li><strong>Complete Coverage:</strong> Processes all three entity types and their relationships</li>
        </ul>
      </div>
    </div>
  );
};

export default TransformDataDemo;