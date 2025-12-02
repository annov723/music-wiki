# Music Wiki

Aplikacja typu SPA zaprojektowana do wizualizacji i zarządzania biblioteką muzyczną. Aplikacja umożliwia użytkownikom tworzenie połączeń między artystami, albumami i utworami za pomocą grafowej bazy danych.

## Technologie

* **Baza Danych:** [Neo4j AuraDB (Warstwa Darmowa)](https://neo4j.com/cloud/aura/)
* **Backend:** Node.js, Apollo, `@neo4j/graphql`
* **Frontend:** React, Apollo
* **Wizualizacja:** `react-force-graph`

## Struktura bazy danych

* **Węzły:** `Artist`, `Album`, `Song`
* **Relacje:**
    * `(:Artist)-->(:Album)` (M:N)
    * `(:Artist)-->(:Song)` (M:N)
    * `(:Album)-->(:Song)` (1:N)

```
type Artist {
    id: ID! @id
    name: String!
    nationality: String
    spotifyUrl: String
    albums: [Album!]! @relationship(type: "RELEASED", direction: OUT)
    songs: [Song!]! @relationship(type: "PERFORMED", direction: OUT)
}

type Album {
    id: ID! @id
    title: String!
    releaseYear: Int
    artists: [Artist!]! @relationship(type: "RELEASED", direction: IN)
    songs: [Song!]! @relationship(type: "CONTAINS", direction: OUT)
}

type Song {
    id: ID! @id
    title: String!
    genre: String
    spotifyUrl: String
    artists: [Artist!]! @relationship(type: "PERFORMED", direction: IN)
    album: Album @relationship(type: "CONTAINS", direction: IN)
}
```

## Uruchomienie aplikacji

Wymagania:
- Node.js
- NPM


```
npm install

npm run sample-data // żeby dodać przykładowe dane

npm run dev
npm run frontend
```

* serwer: http://localhost:4000
* web application: http://localhost:5173