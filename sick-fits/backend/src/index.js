//Make sure that the variables.env are available to our application.
//This is the entry point of our application
require('dotenv').config({path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

//TODO Use express middleware to handle cookies (JWT)
//TODO Use express middleware to populate current user

server.start({
    cors:{
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },//aproved urls
}, deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
    });
