/**
 * NODE_ENV environment variable defines the environment we're in:
 *  - development
 *  - test
 *  - production
 * Heroku and other providers set this environment variable to
 * 'production'.
 * We want to default it to 'development' if we are running the
 * server locally and set it to 'test' (this is done in the
 * package.json test script) when we are running our tests.
 * 
 * In the two situations that are under our control:
 *  - test
 *  - development
 * we will set the values of PORT and MONGODB_URI environment
 * variables.
 * These are set by Heroku in the production environment.
 */

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}