import uuidv4 from 'uuid/v4'

const Mutation = {
    // CREATE USER
    createUser(parent, args, {db}, info) {
        const emailTaken = db.users.some((user) => user.email === args.data.email)

        if (emailTaken) {
            throw new Error('Email is already taken')
        }

        const user = {
            id: uuidv4(),
            ...args.data
        }

        db.users.push(user)

        return user
    },
    // DELETE USER
    deleteUser(parent, args, {db}, info){
        const userIndex = db.users.findIndex((user) => user.id === args.id)

        // Check for an index match
        if (userIndex === -1){
            throw new Error('User not found')
        }
        // If match is found - remove user from users array
        const deletedUsers = db.users.splice(userIndex, 1)

        // Remove associated posts from deleted user
        db.posts = db.posts.filter((post) => {
            const match = post.author === args.id

            // Delete comments from deleted user, from each post created by the deleted user
            if(match){
                comments = db.comments.filter((comment) => comment.post !== post.id)
            }
            return !match
        })
        // Delete all comments made by deleted user
        db.comments = db.comments.filter((comment) => comment.author !== args.id)

        return deletedUsers[0]
    },
    // CREATE POST
    createPost(parent, args, {db}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author)

        if (!userExists) {
            throw new Error('User does not exist')
        }
        
        const post = {
            id: uuidv4(),
            ...args.data
        }

        db.posts.push(post)

        return post
    },
    // DELETE POST
    deletePost(parent, args, {db}, info){
        const postIndex = db.posts.findIndex((post) => post.id === args.id)

        // Check for index match
        if(postIndex === -1){
            throw new Error('Post not found')
        }

        const deletedPosts = db.posts.splice(postIndex, 1)

        // Delete associated comments
        db.comments = db.comments.filter((comment) => comment.post !== args.id)

        return deletedPosts[0]

    },
    // CREATE COMMENT
    createComment(parent, args, {db}, info) {
        // if post && user exist - Create the comment

        const userExists = db.users.some((user) => user.id === args.data.author)
        const postIsPublished = db.posts.some((post) => post.id === args.data.post && post.published)

        if (!userExists || !postIsPublished){
            throw new Error('Unable to post comment, post is not published or user does not exist')
        }

        const comment = {
            id: uuidv4(),
            ...args.data
        }

        db.comments.push(comment)
        return comment
    },
    // DELETE COMMENT
    deleteComment(parent, args, {db}, info){
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id)

        if(commentIndex === -1){
            throw new Error('Comment not found')
        }

        const deletedComments = db.comments.splice(commentIndex, 1)

        return deletedComments[0]
    }
}

export {Mutation as default}