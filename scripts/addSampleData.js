require('dotenv').config();
const neo4j = require('neo4j-driver');

async function addSampleData() {
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    );

    const session = driver.session();

    try {
        // Clear existing data first (optional - remove this if you want to keep existing data)
        await session.run('MATCH (n) DETACH DELETE n');
        console.log('Cleared existing data');

        // Create sample artists
        const createArtists = await session.run(`
            CREATE (artist1:Artist {id: "1", name: "The Beatles", nationality: "UK", spotifyUrl: "https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2"})
            CREATE (artist2:Artist {id: "2", name: "John Lennon", nationality: "UK", spotifyUrl: "https://open.spotify.com/artist/4x1nvY2FN8jxqAFA0DA02H"})
            CREATE (artist3:Artist {id: "3", name: "Paul McCartney", nationality: "UK", spotifyUrl: "https://open.spotify.com/artist/4STHEaNw4mPZ2tzheohgXB"})
            RETURN artist1, artist2, artist3
        `);
        console.log('Created artists');

        // Create sample albums
        const createAlbums = await session.run(`
            CREATE (album1:Album {id: "1", title: "Abbey Road", releaseYear: 1969})
            CREATE (album2:Album {id: "2", title: "Sgt. Pepper's Lonely Hearts Club Band", releaseYear: 1967})
            CREATE (album3:Album {id: "3", title: "Imagine", releaseYear: 1971})
            RETURN album1, album2, album3
        `);
        console.log('Created albums');

        // Create sample songs
        const createSongs = await session.run(`
            CREATE (song1:Song {id: "1", title: "Come Together", genre: "Rock", spotifyUrl: "https://open.spotify.com/track/2EqlS6tkEnglzr7tkKAAYD"})
            CREATE (song2:Song {id: "2", title: "Here Comes The Sun", genre: "Rock", spotifyUrl: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2"})
            CREATE (song3:Song {id: "3", title: "Lucy in the Sky with Diamonds", genre: "Psychedelic Rock", spotifyUrl: "https://open.spotify.com/track/25yQPHgC35WNnnOUqFhgVR"})
            CREATE (song4:Song {id: "4", title: "Imagine", genre: "Rock", spotifyUrl: "https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9"})
            CREATE (song5:Song {id: "5", title: "Yesterday", genre: "Ballad", spotifyUrl: "https://open.spotify.com/track/3BQHpFgAp4l80e1XslIjNI"})
            RETURN song1, song2, song3, song4, song5
        `);
        console.log('Created songs');

        // Create relationships - The Beatles RELEASED albums
        await session.run(`
            MATCH (artist:Artist {id: "1"}), (album1:Album {id: "1"}), (album2:Album {id: "2"})
            CREATE (artist)-[:RELEASED]->(album1),
                   (artist)-[:RELEASED]->(album2)
        `);

        // John Lennon RELEASED his solo album
        await session.run(`
            MATCH (artist:Artist {id: "2"}), (album:Album {id: "3"})
            CREATE (artist)-[:RELEASED]->(album)
        `);

        // Albums CONTAIN songs - Abbey Road
        await session.run(`
            MATCH (album1:Album {id: "1"}), (song1:Song {id: "1"}), (song2:Song {id: "2"})
            CREATE (album1)-[:CONTAINS]->(song1),
                   (album1)-[:CONTAINS]->(song2)
        `);

        // Albums CONTAIN songs - Sgt. Pepper's
        await session.run(`
            MATCH (album2:Album {id: "2"}), (song3:Song {id: "3"}), (song5:Song {id: "5"})
            CREATE (album2)-[:CONTAINS]->(song3),
                   (album2)-[:CONTAINS]->(song5)
        `);

        // Albums CONTAIN songs - Imagine
        await session.run(`
            MATCH (album3:Album {id: "3"}), (song4:Song {id: "4"})
            CREATE (album3)-[:CONTAINS]->(song4)
        `);

        // Artists PERFORMED songs
        await session.run(`
            MATCH (beatles:Artist {id: "1"}), (john:Artist {id: "2"}), (paul:Artist {id: "3"})
            MATCH (song1:Song {id: "1"}), (song2:Song {id: "2"}), (song3:Song {id: "3"}), (song4:Song {id: "4"}), (song5:Song {id: "5"})
            CREATE (beatles)-[:PERFORMED]->(song1),
                   (beatles)-[:PERFORMED]->(song2),
                   (beatles)-[:PERFORMED]->(song3),
                   (beatles)-[:PERFORMED]->(song5),
                   (john)-[:PERFORMED]->(song1),
                   (john)-[:PERFORMED]->(song4),
                   (paul)-[:PERFORMED]->(song2),
                   (paul)-[:PERFORMED]->(song5)
        `);
        console.log('Created relationships');

        console.log('Sample data added successfully!');

    } catch (error) {
        console.error('Error adding sample data:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

addSampleData();