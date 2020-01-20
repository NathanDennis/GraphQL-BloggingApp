import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

// Demo user data
let users = [{
    id: '1',
    name: 'Nathan',
    email: 'nathan@example.com',
    age: 29
}, {
    id: '2',
    name: 'Andrew',
    email: 'andrew@example.com'
}, {
    id: '3',
    name: 'Sarah',
    email: 'sarah@example.com'
}]

// Demo post data
let posts = [{
    id: '1',
    title: 'Title 1',
    body: 'Post body 1',
    published: true,
    author: '1'

}, {
    id: '2',
    title: 'Title 2',
    body: 'Post body test 2',
    published: false,
    author: '2'
}, {
    id: '3',
    title: 'Title 3',
    body: 'Post body test 3',
    published: false,
    author: '3'
}]

// Demo comment data
let comments = [{
    id: 'cmt-001',
    text: 'This is the first text comment',
    author: '1',
    post: '3'
}, {
    id: 'cmt-002',
    text: 'This is the second text comment',
    author: '1',
    post: '3'
}, {
    id: 'cmt-003',
    text: 'This is the third text comment',
    author: '2',
    post: '2'
}, {
    id: 'cmt-004',
    text: 'This is the fourth text comment',
    author: '3',
    post: '1'
}]

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput!): Post!
        deletePost(id: ID!): Post!
        createComment(data: CreateCommentInput!): Comment!
        deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`
// Resolvers
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (!args.query) {
                return users
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }
            return posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) 
                || post.body.toLowerCase().includes(args.query.toLowerCase())
                || post.published
            })
        },
        comments(parent, args, ctx, info) {
            return comments
        },
        me() {
            return {
                id: 'abc123',
                name: 'Nathan',
                email: 'nathan@example.com',
                age: 29
            }
        },
        post() {
            return {
                id: 'post123',
                title: 'Post Title',
                body: 'Post Body',
                published: true
            }
        }
    },
    // Mutation resolvers
    Mutation: {
        // CREATE USER
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email is already taken')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        // DELETE USER
        deleteUser(parent, args, ctx, info){
            const userIndex = users.findIndex((user) => user.id === args.id)

            // Check for an index match
            if (userIndex === -1){
                throw new Error('User not found')
            }
            // If match is found - remove user from users array
            const deletedUsers = users.splice(userIndex, 1)

            // Remove associated posts from deleted user
            posts = posts.filter((post) => {
                const match = post.author === args.id

                // Delete comments from deleted user, from each post created by the deleted user
                if(match){
                    comments = comments.filter((comment) => comment.post !== post.id)
                }
                return !match
            })
            // Delete all comments made by deleted user
            comments = comments.filter((comment) => comment.author !== args.id)

            return deletedUsers[0]
        },
        // CREATE POST
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)

            if (!userExists) {
                throw new Error('User does not exist')
            }
            
            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post)

            return post
        },
        // DELETE POST
        deletePost(parent, args, ctx, info){
            const postIndex = posts.findIndex((post) => post.id === args.id)

            // Check for index match
            if(postIndex === -1){
                throw new Error('Post not found')
            }

            const deletedPosts = posts.splice(postIndex, 1)

            // Delete associated comments
            comments = comments.filter((comment) => comment.post !== args.id)

            return deletedPosts[0]

        },
        // CREATE COMMENT
        createComment(parent, args, ctx, info) {
            // if post && user exist - Create the comment

            const userExists = users.some((user) => user.id === args.data.author)
            const postIsPublished = posts.some((post) => post.id === args.data.post && post.published)

            if (!userExists || !postIsPublished){
                throw new Error('Unable to post comment, post is not published or user does not exist')
            }

            const comment = {
                id: uuidv4(),
                ...args.data
            }

            comments.push(comment)
            return comment
        },
        // DELETE COMMENT
        deleteComment(parent, args, ctx, info){
            const commentIndex = comments.findIndex((comment) => comment.id === args.id)

            if(commentIndex === -1){
                throw new Error('Comment not found')
            }

            const deletedComments = comments.splice(commentIndex, 1)

            return deletedComments[0]
        }
    },

    Post: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    User: {
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(() => {
    console.log('Server has started')
})