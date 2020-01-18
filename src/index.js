import { GraphQLServer } from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

// Demo user data
const users = [{
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
const posts = [{
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
const comments = [{
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
        createUser(name: String!, email: String!, age: Int): User!
        createPost(title: String!, body: String!, published: Boolean!, author: ID!): Post!
        createComment(text: String!, author: ID!, post: ID!): Comment!
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
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.email)

            if (emailTaken) {
                throw new Error('Email is already taken')
            }

            const user = {
                id: uuidv4(),
                name: args.name,
                email: args.email,
                age: args.age
            }

            users.push(user)

            return user
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.author)

            if (!userExists) {
                throw new Error('User does not exist')
            }
            
            const post = {
                id: uuidv4(),
                title: args.title,
                body: args.body,
                published: args.published,
                author: args.author
            }

            posts.push(post)

            return post
        },
        // CREATE COMMENT
        createComment(parent, args, ctx, info) {
            // if post && user exist
            const userExists = users.some((user) => user.id === args.author)
            const postIsPublished = posts.some((post) => post.published)

            if (!userExists || !postIsPublished){
                throw new Error('Unable to post comment, post is not published or user does not exist')
            }

            const comment = {
                id: uuidv4(),
                text: args.text,
                author: args.author,
                post: args.post
            }

            comments.push(comment)
            return comment
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