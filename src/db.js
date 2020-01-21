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

const db = {
    users,
    posts,
    comments
}
export {db as default}