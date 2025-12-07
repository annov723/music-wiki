# Music Wiki

Aplikacja typu SPA zaprojektowana do wizualizacji i zarządzania biblioteką muzyczną. Aplikacja umożliwia użytkownikom tworzenie połączeń między artystami, albumami i utworami za pomocą grafowej bazy danych.

## Technologie

* **Baza Danych:** Neo4j AuraDB
* **Backend:** Node.js, Apollo
* **Frontend:** React, Apollo

## Struktura bazy danych

* **Węzły:** `Artist`, `Album`, `Song`
* **Relacje:**
    * `(Artist)-->(Album)` (1:N)
    * `(Artist)-->(Song)` (M:N)
    * `(Album)-->(Song)` (1:N)

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
    spotifyUrl: String
    artist: [Artist!]! @relationship(type: "RELEASED", direction: IN)
    songs: [Song!]! @relationship(type: "CONTAINS", direction: OUT)
}

type Song {
    id: ID! @id
    title: String!
    genre: String
    spotifyUrl: String
    artists: [Artist!]! @relationship(type: "PERFORMED", direction: IN)
    album: [Album!]! @relationship(type: "CONTAINS", direction: IN)
}
```

## Uruchomienie aplikacji

Wymagania:
- Node.js
- NPM

Instalacja zależności w głównym katalogu oraz w katalogu `frontend`:
```
npm install
cd frontend
npm install
```

Uruchomienie serwera z głównego katalogu:
```
npm run dev
```

Uruchomienie aplikacji z głównego katalogu:
```
npm run frontend
```

* serwer: http://localhost:4000
* aplikacja: http://localhost:5173

## Frontend

Frontend aplikacji został zbudowany przy użyciu **React** oraz **Vite**. Do komunikacji z serwerem GraphQL wykorzystano bibliotekę **Apollo Client**. Wizualizacja grafu zrealizowana jest za pomocą **react-force-graph-2d**.

### Wykorzystane biblioteki:

*   **`@apollo/client`** - klient GraphQL do pobierania danych z serwera Apollo i zarządzania stanem
*   **`react-force-graph-2d`** - komponent do renderowania grafu, który wizualizuje dane w postaci węzłów i krawędzi


