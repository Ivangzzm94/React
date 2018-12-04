const { GraphQLServer } = require('graphql-yoga');
//Resolvers -> Mutation(push data) and Query(pull data)
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

//Create graphQL Yoga if (Meteor.isServer) {

function createServer(){
    return new GraphQLServer({
        typeDefs: 'src/schema.graphql',
        resolvers: { 
            Mutation,
            Query,
        },
        resolverValidationOptions: {
            requireResolversForResolveType: false,
        },
        context: req => ({...req, db}),
    });
}

module.exports = createServer;
