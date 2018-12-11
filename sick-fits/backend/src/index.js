//Make sure that the variables.env are available to our application.
//This is the entry point of our application
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

//Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
//Decode the jwt so we can get then user id on each request
server.express.use((req, res, next)=> {
    const { token } = req.cookies;
    if(token) {
        const {userId} = jwt.verify(token, process.env.APP_SECRET);
        //Put the userId onto the req for future requests to access
        req.userId = userId;
    }
    next();
});

server.start({
    cors:{
        credentials: true,
        origin: process.env.FRONTEND_URL,
    },//aproved urls
}, deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
    });
