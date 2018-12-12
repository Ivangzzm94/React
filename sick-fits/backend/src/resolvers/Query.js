const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
    //Foward directly to the database
    items: forwardTo('db'),
    item: forwardTo('db'),
    itemsConnection: forwardTo('db'),
    //Same as me: function(parent,args,ctx,info)
    me(parent, args, ctx, info) {
        //Check if there is a current userId
        if(!ctx.request.userId) {
            return null;
        } 
        //returning a promise
        return ctx.db.query.user({
            where: {id: ctx.request.userId}
        }, info);
    },

    async users(parent, args, ctx, info) {
        // 1. Check if they are logged in
        if (!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        console.log(ctx.request.userId);
        // 2. Check if the user has the permissions to query all the users
        hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    
        // 3. if they do, query all the users!
        return ctx.db.query.users({}, info);
    },
    
};

module.exports = Query;
