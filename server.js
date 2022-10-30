/*
Structure of your endpoints - Can you easily extend the API to support new endpoints as feature requests come in?
Quality of your code - Does your code demonstrate the use of design patterns?
Testability - Is your code testable?
Can your solution be easily configured and deployed? Consider guidelines from
 */

const express = require('express');
const path = require("path");
const app = express();
const OpenApiValidator = require('express-openapi-validator');

const knexMovies = require('knex')({
    client: 'sqlite3',
    debug: true,
    connection: {
        filename: './db/movies.db'
    },
    useNullAsDefault: true
});

const knexRatings = require('knex')({
    client: 'sqlite3',
    debug: true,
    connection: {
        filename: './db/ratings.db'
    },
    useNullAsDefault: true
});

const apiSpec = path.join(__dirname, 'OpenAPI.yaml');
app.use(express.json());

app.use(OpenApiValidator.middleware({
        apiSpec,
        validateResponses: true, // default false
    }),
);

/*
An endpoint exists that lists all movies
List is paginated: 50 movies per page, the page can be altered with the page query params
Columns should include: imdb id, title, genres, release date, budget.
Budget is displayed in dollars
*/
app.get('/allMovies', async (req, res, next) => {
    try {
        const limit = req.query.limit; //defaulted in OpenAPI
        const page = req.query.page; //defaulted in OpenAPI
        const allMovies = await knexMovies.select(['m.imdbId', 'm.title', 'm.genres', 'm.releaseDate', 'm.budget'])
            .from("movies as m")
            .limit(limit)
            .offset(page - 1);
        allMovies.forEach(movie => {
            movie.budget = `$${movie.budget}`;
            movie.genres = JSON.parse(movie.genres);
        });
        res.json(allMovies);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

/*
An endpoint exists that lists the movie details for a particular movie
Details should include: imdb id, title, description, release date, budget, runtime, average rating, genres, original language, production companies
Budget should be displayed in dollars
Ratings are pulled from the rating database
 */
app.get('/movieDetails/:id', async (req, res, next) => {
    try {
        const movieId = req.params.id; // required in OpenAPI
        const theMovieDetails = await knexMovies.select(['m.imdbId', 'm.title', 'm.overview',
            'm.releaseDate', 'm.budget', 'm.runtime', 'm.genres', 'm.language', 'm.productionCompanies'])
            .from('movies as m')
            .where('m.movieID', `${movieId}`); //prevents sql injection
        if (theMovieDetails.length === 0) {
            return res.status(404).send('ERROR: ID NOT FOUND');
        }
        theMovieDetails.forEach(theMovie => {
            theMovie.budget = `$${theMovie.budget}`
            theMovie.genres = JSON.parse(theMovie.genres);
            theMovie.productionCompanies = JSON.parse(theMovie.productionCompanies);
        })
        const theMovieRating = await knexRatings.avg('r.rating as rating')
            .from('ratings as r')
            .where(`r.movieID`, `${movieId}`);
        const theFullMovie = {
            ...theMovieDetails[0],
            ...theMovieRating[0]
        }
        return res.json(theFullMovie);
    } catch (error) {
        console.log(error)
        next(error);
    }
});

/*
An endpoint exists that will list all movies from a particular year
List is paginated: 50 movies per page, the page can be altered with the page query params
List is sorted by date in chronological order
Columns include: imdb id, title, genres, release date, budget
 */
app.get('/moviesByYear/:year', async (req, res, next) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const year = req.params.year;
        const movies = await knexMovies.select(['m.imdbId', 'm.title', 'm.genres', 'm.releaseDate', 'm.budget'])
            .from('movies as m')
            .whereBetween('m.releaseDate', [`${year}-01-01`, `${year}-12-31`])
            .orderBy('m.releaseDate', 'desc')
            .limit(limit)
            .offset(page - 1);
        movies.forEach((movie) => {
            movie.genres = JSON.parse(movie.genres);
            movie.budget = `$${movie.budget}`
        })
        res.json(movies);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

/*
An endpoint exists that will list all movies by a genre
List is paginated: 50 movies per page, the page can be altered with the page query params
Columns include: imdb id, title, genres, release date, budget
 */
app.get('/movieGenre/:genre', async (req, res, next) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const genre = req.params.genre;
        const movieByGenre = await knexMovies.select(['m.imdbId', 'm.title', 'm.genres', 'm.releaseDate', 'm.budget'])
            .from('movies as m')
            .whereLike('genres', `%${genre}%`)
            .limit(limit)
            .offset(page - 1);
        movieByGenre.forEach((movie) => {
            movie.genres = JSON.parse(movie.genres);
            movie.budget = `$${movie.budget}`
        })
        res.json(movieByGenre);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

app.listen(4000, () => console.log('Movie server is up.'));

module.exports = app;


