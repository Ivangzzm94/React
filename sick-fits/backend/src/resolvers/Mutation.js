const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutations = {
    async createItem(parent, args, ctx, info) {
        if(!ctx.request.userId) {
            throw new Error('You must be logged in to do that!');
        }

        const item = await ctx.db.mutation.createItem(
        {
            data: {
                //This is how to create a relationship between the Item and the User
                user: {
                    connect: {
                        id: ctx.request.userId
                    }
                },
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
        const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
        //2. Check if they own that item, or have the permissions
        const ownsItem = item.user.id === ctx.request.userId;
        // some check if at list one
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));

        if(ownsItem || hasPermissions) {
            //nothing
        } else {
            throw new Error("You dont have permission to do that!");
        }
        // 3. Delete it!
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async singup(parent, args, ctx, info) {
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
    //async signin(parent, args, ctx, info)
    async signin(parent, { email, password  }, ctx, info) {
        //1. Check if there is a user with that email
        const user = await ctx.db.query.user({where: { email }})
        if(!user) {
            throw new Error(`No such user found for email ${email}`);
        }
        //2. Check if their password is correct
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error(`Wrong password`);
        }
        //3. Generate the JWT Token
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        //4. Set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //5. Return the user
        return user;
    },
    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');
        return { message: 'GoodBye!' };
    },
    async requestReset(parent, args, ctx, info) {
        //1. Check if this is a real user
        const user = await ctx.db.query.user({where: {email: args.email}});
        if(!user) {
            throw new Error(`No such user found for email ${args.email}`);
        }
        //2. Set a reset token and expiry on that user
        const randomBytesPromiseified = promisify(randomBytes);
        const resetToken = (await randomBytesPromiseified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
        const res = await ctx.db.mutation.updateUser({
            where: { email: args.email },
            data: {resetToken, resetTokenExpiry}
        });
        //console.log(res);
        
        //3. Email them that reset token
        const mailRes = await transport.sendMail({
            from: 'sickfits@hotmail.com',
            to: user.email,
            subject: 'Password Reset Token',
            html: makeANiceEmail(`Your Password Reset Token is Here!
            \n\n 
            <a href="${process.env
                .FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
        });
        //4. Return a message
        return { message: 'Thanks!'};
    },
    async resetPassword(parent, args, ctx, info) {
        //1. Check if the passwords match
        if(args.password !== args.confirmPassword) {
            throw new Error('You Password dont match!');
        }
        //2. Check if its a legit reset token
        //3. Check if is expired
        const [user] = await ctx.db.query.users({
            where: {
                resetToken: args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000,
            },
        });
        if (!user) {
            throw new Error("This token is either invalid or expired!");
        }
        //4. Hash their new password
        const password = await bcrypt.hash(args.password, 10);
        //5. Save the new password to the user and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: {
                password,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        //6. Generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        //7. Set the JWT cookie
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        //8. Return the new user
        return updatedUser;
    },
    async updatePermissions(parent, args, ctx, info) {
        //1. Check if they are logged in
        if(!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        //2. Query the current user
        const currentUser = await ctx.db.query.user(
            {
                where: {
                    id: ctx.request.userId,
                },
            },
            info
        );
        //3. Check if they have permission to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        //4. Update the permissions
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions,
                },
            },
            where: {
                id: args.userId,
            },
        }, 
        info
        );
    },
    async addToCart(parent, args, ctx, info) {
        //1.  Make sure they are signed in
        const { userId } = ctx.request.userId;
        if(!userId) {
            throw new Error('You must be signed in!')
        }
        //2. Query the users current cart
        const [existingCartItem] = await ctx.db.query.createItems({
            user: { id: userId },
            item: { id: args.id },
        })
        //3. Check if that item is alredy in their cart and increment by 1 if it if it is 
        if(existingCartItem) {
            console.log('This item is already in the cart');
            return ctx.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1},
            });
        }
        //4. If its not, create a fresh CartItem for that User
        return ctx.db.mutation.createCartItem({
            data: {
                user: {
                    connect: { id: userId},
                },
                item: {
                    connect: { id: args.id },
                },
            },
        });
    },
};

module.exports = Mutations;
