const { forwardTo } = require('prisma-binding');

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
};

module.exports = Query;
