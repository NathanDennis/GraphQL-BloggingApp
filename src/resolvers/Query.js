const Query = {
    users(parent, args, {db}, info) {
        if (!args.query) {
            return db.users
        }

        return users.filter((user) => {
            return user.name.toLowerCase().includes(args.query.toLowerCase())
        })
    },
    posts(parent, args, {db}, info) {
        if (!args.query) {
            return db.posts
        }
        return db.posts.filter((post) => {
            return post.title.toLowerCase().includes(args.query.toLowerCase()) 
            || post.body.toLowerCase().includes(args.query.toLowerCase())
            || post.published
        })
    },
    comments(parent, args, {db}, info) {
        return db.comments
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
}

export {Query as default}