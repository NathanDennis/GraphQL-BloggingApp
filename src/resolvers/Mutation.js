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
    // UPDATE USER
    updateUser(parent, args, {db}, info){
        const {id, data} = args
        const user = db.users.find((user) => user.id === id)
        // Check for user match
        if (!user) {
            throw new Error('User not found')
        }

        // Update details if provided
        if (typeof data.email === 'string'){
            const emailTaken = db.users.some((user) => user.email === data.email)

            if(emailTaken){
                throw new Error('Email already in use')
            }

            user.email = data.email
        }

        if (typeof data.name === 'string'){
            user.name = data.name
        }

        if (typeof data.age !== 'undefined') {
            user.age = data.age
        }

        return user
    },
    // CREATE POST
    createPost(parent, args, {db, pubsub}, info) {
        const userExists = db.users.some((user) => user.id === args.data.author)

        if (!userExists) {
            throw new Error('User does not exist')
        }
        
        const post = {
            id: uuidv4(),
            ...args.data
        }

        db.posts.push(post)

        if(args.data.published){
            pubsub.publish('post', {
                post: {
                    mutation: 'CREATED',
                    data: post
                }
            })  
        }

        return post
    },
    // DELETE POST
    deletePost(parent, args, {db, pubsub}, info){
        const postIndex = db.posts.findIndex((post) => post.id === args.id)

        // Check for index match
        if(postIndex === -1){
            throw new Error('Post not found')
        }

        const [post] = db.posts.splice(postIndex, 1)

        // Delete associated comments
        db.comments = db.comments.filter((comment) => comment.post !== args.id)

        if(post.published){
            pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: post
                }
            })
        }

        return post

    },
    // UPDATE POST
    updatePost(parent, args, {db, pubsub}, info){
        const {id, data} = args
        const post = db.posts.find((post) => post.id === id)
        const originalPost = {...post}

        if(!post){
            throw new Error('Post not found')
        }

        if(typeof data.title === 'string'){
            post.title = data.title
        }

        if(typeof data.body === 'string'){
            post.body = data.body
        }

        if(typeof data.published === 'boolean'){
            post.published = data.published

            // Check if post was originally published, and is now unpublished
            if(originalPost.published && !post.published){
                // Deleted subscription notifier
                pubsub.publish('post', {
                    post: {
                        mutation: 'DELETED',
                        data: originalPost // Return original data so any changes before deleting aren't leaked
                   }
                })
            } else if(!originalPost.published && post.published) {
                // Checking if post was unpublished and is now published
                pubsub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                })
            }
        } else if (post.published){
            // Updated notifier
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: post
                }
            })
        }

        return post
    },
    // CREATE COMMENT
    createComment(parent, args, {db, pubsub}, info) {
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
        pubsub.publish(`comment ${args.data.post}`, {
            comment: {
                mutation: 'CREATED',
                data: comment
            }
        } )
        return comment
    },
    // DELETE COMMENT
    deleteComment(parent, args, {db, pubsub}, info){
        const commentIndex = db.comments.findIndex((comment) => comment.id === args.id)

        if(commentIndex === -1){
            throw new Error('Comment not found')
        }

        const [deletedComment] = db.comments.splice(commentIndex, 1)

        pubsub.publish(`comment ${deletedComment.post}`, {
            comment: {
                mutation: 'DELETED',
                data: deletedComment
            }
        })

        return deletedComment
    },
    updateComment(parent, args, {db, pubsub}, info){
        const {id, data} = args
        const comment = db.comments.find((comment) => comment.id === id)

        if(!comment){
            throw new Error('Comment not found')
        }

        if(typeof data.text === 'string'){
            comment.text = data.text
        }

        pubsub.publish(`comment ${comment.post}`, {
            comment: {
                mutation: 'UPDATED',
                data: comment
            }
        })

        return comment
    }
}

export {Mutation as default}