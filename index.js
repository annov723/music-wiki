require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const neo4j = require('neo4j-driver');
const { Neo4jGraphQL } = require('@neo4j/graphql');

// GraphQL type definitions based on the schema from copilot-context.md
const typeDefs = `
    type Artist @node {
        id: ID! @id
        name: String!
        nationality: String
        spotifyUrl: String
        # Relationships
        albums: [Album!]! @relationship(type: "RELEASED", direction: OUT)
        songs: [Song!]! @relationship(type: "PERFORMED", direction: OUT)
    }

    type Album @node {
        id: ID! @id
        title: String!
        releaseYear: Int
        spotifyUrl: String
        # Relationships - Album has ONE artist and many songs
        artist: [Artist!]! @relationship(type: "RELEASED", direction: IN)
        songs: [Song!]! @relationship(type: "CONTAINS", direction: OUT)
    }

    type Song @node {
        id: ID! @id
        title: String!
        genre: String
        spotifyUrl: String
        # Relationships - Song belongs to ONE album and can have many artists
        artists: [Artist!]! @relationship(type: "PERFORMED", direction: IN)
        album: [Album!]! @relationship(type: "CONTAINS", direction: IN)
    }
`;

async function startServer() {
    try {
        // Create Neo4j driver instance
        const driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
        );

        // Verify connectivity
        await driver.verifyConnectivity();
        console.log('Successfully connected to Neo4j');

        // Create Neo4jGraphQL instance
        const neoSchema = new Neo4jGraphQL({
            typeDefs,
            driver
        });

        // Build the schema
        const schema = await neoSchema.getSchema();

        // Create Apollo Server instance
        const server = new ApolloServer({
            schema,
        });

        // Start the server
        const { url } = await startStandaloneServer(server, {
            listen: { port: 4000 },
        });

        console.log(`🚀 Server ready at ${url}`);
        console.log(`GraphQL Playground available at ${url}`);

    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();