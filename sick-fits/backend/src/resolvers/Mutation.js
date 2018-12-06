const Mutations = {
    async createItem(parent, args, ctx, info) {
        //TODO: Check if they are logged in
        //access context of ./createServer
        const item = await ctx.db.mutation.createItem(
        {
            data: {
                ...args,
            },
        }, 
        info
    );

        console.log(item);

        return item;
    },
    updateItem(parent, args, ctx, info) {
        // first take a copy of the updates
        const updates = {...args};
        // remove the id from the updates
        delete updates.id;
        // run the update method
        // ctx -> context in the request
        // db => how we expose the actual prisma database to ourselves
        //query/mutation
        //access to all query/mutations generated
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            },
        }, 
        info //this contains the query we sent throwght client side
        );
        return item;
    },
};

module.exports = Mutations;
