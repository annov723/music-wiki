# Music-Wiki: Project Context & Implementation Guide

## Project Goal
We are building a web application to manage a music database using a **Graph Database**. The app visualizes relationships between Artists, Albums, and Songs.

## Core Technology
1.  **Database:** Neo4j AuraDB.
2.  **API Layer:** GraphQL using the `@neo4j/graphql` library (this is crucial: we rely on this library to auto-generate CRUD resolvers and Cypher queries).
3.  **Frontend:** React with `react-force-graph-2d` for visualization.

## Data Schema & Business Rules
The following is the STRICT GraphQL type definition representing our business logic.

### 1. Constraints
* **Artist:** Can have multiple albums and songs.
* **Album:** Can belong to multiple artists (e.g., collaborations).
* **Song:** Can belong to multiple artists (features/duets) but **MUST belong to exactly ONE album**.

### 2. GraphQL Schema (Neo4j)
Use this schema as the source of truth when generating backend code:

```graphql
type Artist {
    id: ID! @id
    name: String!
    nationality: String
    spotifyUrl: String
    # Relationships
    albums: [Album!]! @relationship(type: "RELEASED", direction: OUT)
    songs: [Song!]! @relationship(type: "PERFORMED", direction: OUT)
}

type Album {
    id: ID! @id
    title: String!
    releaseYear: Int
    # Relationships
    artists: [Artist!]! @relationship(type: "RELEASED", direction: IN)
    songs: [Song!]! @relationship(type: "CONTAINS", direction: OUT)
}

type Song {
    id: ID! @id
    title: String!
    genre: String
    spotifyUrl: String
    # Relationships
    artists: [Artist!]! @relationship(type: "PERFORMED", direction: IN)
    # Note: Song belongs to only one album, so this is a single object, not an array
    album: Album @relationship(type: "CONTAINS", direction: IN)
}