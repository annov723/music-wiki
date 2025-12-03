import { transformData } from '../utils/transformData.js';

// Test data matching the GraphQL response structure
const testData = {
  artists: [
    {
      id: "1",
      name: "Test Artist",
      nationality: "USA",
      spotifyUrl: "https://spotify.com/artist/1",
      albums: [
        {
          id: "1",
          title: "Test Album",
          releaseYear: 2023,
          songs: [
            {
              id: "1",
              title: "Test Song",
              genre: "Rock",
              artists: [{ id: "1", name: "Test Artist" }]
            }
          ]
        }
      ],
      songs: [
        {
          id: "1",
          title: "Test Song",
          genre: "Rock",
          album: [{ id: "1", title: "Test Album" }]
        }
      ]
    }
  ],
  albums: [],
  songs: []
};

// Test the transform function
console.log('🧪 Testing transformData function...\n');

const result = transformData(testData);

console.log('📊 Results:');
console.log(`Nodes: ${result.nodes.length}`);
console.log(`Links: ${result.links.length}\n`);

console.log('📝 Node details:');
result.nodes.forEach(node => {
  console.log(`- ${node.name} (${node.type}, group: ${node.group})`);
});

console.log('\n🔗 Link details:');
result.links.forEach(link => {
  console.log(`- ${link.source} → ${link.target} (${link.type})`);
});

console.log('\n✅ Transform function test completed!');

export { testData, result };