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

## Komponenty Frontend

### GraphCanvas.js
Główny komponent wizualizacji grafu z funkcjami:
- **Auto-resize:** Automatyczne dostosowywanie do rozmiaru okna
- **Auto-fit:** Automatyczne dopasowanie widoku do wszystkich węzłów  
- **Color coding:** Kolorowanie węzłów według typu (group property)
- **Node labels:** Wyświetlanie etykiet na węzłach przy odpowiednim przybliżeniu
- **Interactions:** Klikanie węzłów (focus), hover effects, zoom, pan
- **Responsive:** Pełne wsparcie dla różnych rozmiarów ekranu

### transformData()
Funkcja utilitarna konwertująca dane GraphQL do formatu grafu:
```javascript
import { transformData } from './utils/transformData';

const graphData = transformData(apolloQueryResult);
// Returns: { nodes: [], links: [] }
// Nodes have: id, type, group, name, ...otherData  
// Links have: id, source, target, type, value
```

**Node groups dla color coding:**
- Group 1: Artists (czerwony #ff6b6b)
- Group 2: Albums (niebieskozielony #4ecdc4) 
- Group 3: Songs (niebieski #45b7d1)