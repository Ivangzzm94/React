const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
                id: args.id,
            },
        }, 
        info //this contains the query we sent throwght client side
        );
        //return item;
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        //1. find the item
        const item = await ctx.db.query.item({ where }, `{id title}`);
        //2. Check if they own that item, or have the permissions
        // TODO
        // 3. Delete it!
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async signup(parent, args, ctx, info) {
        // Lowercase the email
        args.email = args.email.toLowerCase();
        // Hash the password
        const password = await bcrypt.hash(args.password, 10);
        // Create user in the databse
        const user = await ctx.db.mutation.createUser(
            {
                data: {
                    ...args, // name: args.name email: args.email
                    password, // password: password
                    permissions: { set: ['USER'] },
                },
            },
            info
        );
        // Create the JWT token for them
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        // Set the jwt as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
        });
        // Finaly we return the user to the browser
        return user;
    },
};

module.exports = Mutations;
