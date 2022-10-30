/*
Test For:
Basic Connection of all endpoints
Query for Page 0 or pages that do not exist
Query for Limit over 50
Match Objects/Expected Output for all endpoints
movieDetails check for an ID that does not exist
Check year is not before 1900
*/

const request = require('supertest');
const app = require('../aetna-movie/server');

test('Get from allMovies test', async () => {
    await request(app)
        .get('/allMovies')
        .expect(200);
});

test('Check that a user querying for page 0 returns a 400', async () => {
    await request(app)
        .get('/allMovies?page=0')
        .expect(400);
});

test('Testing for 400 error when limit goes over 50 in allMovies endpoint', async () => {
    await request(app)
        .get('/allMovies?limit=72')
        .expect(400);
});

test('Get from allMovies test and expect a result', async () => {
    const response = await request(app)
        .get('/allMovies?limit=2')
        .expect(200);
    expect(response._body.length).toBe(2)
});

test('Get a movies specific details', async () => {
    const response = await request(app)
        .get('/movieDetails/2')
        .expect(200);
    expect(response._body.imdbId).toBe("tt0094675")
});

test('Checking Error ID NOT FOUND with ID = 1 which does not exist.', async () => {
    await request(app)
        .get('/movieDetails/1')
        .expect(404);
});

test('Get details from a movie in a specific year', async () => {
    const response = await request(app)
        .get('/moviesByYear/2002')
        .expect(200);
    expect(response._body.length).toBe(50)
});

test('Check that a user querying for page 0 on endpoint moviesByYear returns a error', async () => {
    await request(app)
        .get('/moviesByYear/2002?page=0')
        .expect(400);
});

test('Testing for 400 when limit goes over 50 in moviesByYear endpoint', async () => {
    await request(app)
        .get('/moviesByYear/2002?limit=75')
        .expect(400);
});

test('Checking for a 400 Testing for a year before 1900', async () => {
    await request(app)
        .get('/moviesByYear/1880')
        .expect(400);
});

test('Get details from a specific genre', async () => {
    const response = await request(app)
        .get('/movieGenre/Horror')
        .expect(200);
    expect(response._body.length).toBe(50)
});

test('Check that a user querying for page 0 on endpoint movieGenre returns a error', async () => {
    await request(app)
        .get('/movieGenre/Horror?page=0')
        .expect(400);
});

test('Testing for 400 when limit goes over 50 in moviesGenre endpoint', async () => {
    await request(app)
        .get('/movieGenre/Horror?limit=75')
        .expect(400);
});

