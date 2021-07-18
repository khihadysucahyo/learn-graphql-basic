const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const app = express()

const forumData = [
    { id: 1, title: 'Cara Belajar', desc: 'Cara belajar dari GraphQL', userID: 1 },
    { id: 2, title: 'Jalur Belajar', desc: 'Jalur belajar dari GraphQL', userID: 2  },
    { id: 3, title: 'Cara Menggunakan', desc: 'Cara menggunakan GraphQL', userID: 2 },
]


const userData = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
    { id: 3, name: 'Bob Smith' },
]

let schema = buildSchema(`
    type Forum {
        id: Int!
        title: String!
        desc: String!
        user: User
    }

    type User {
        id: Int!
        name: String!
        forums: [Forum]
    }

    type Query {
        forum(id: Int!): Forum
        forums: [Forum]
        user(id: Int!): User
        users: [User]
    }

    type Mutation {
        addUser(name: String!): User
        addForum(title: String!, desc: String!, userID: Int!): Forum
    }
`)

let resolvers = {
    forum: (args) => {
        const _forum = forumData.find(forum => forum.id === args.id)
        const _user = userData.find(user => user.id === _forum.userID) 
        _forum.user = _user
        return _forum
    },

    forums: () => {
        forumData.map(forum => {
            const _user = userData.find(user => user.id === forum.userID) 
            forum.user = _user
            return forum
        })
        return forumData
    },

    user: (args) => {
        const _user = userData.find(user => user.id === args.id)
        const _forums = forumData.filter(forum => forum.userID === args.id)
        _user.forums = _forums
        return _user
    },

    users: () => {
        userData.map(user => {
            const _forums = forumData.filter(forum => forum.userID === user.id)
            user.forums = _forums
            return user
        })
        return userData
    },

    addUser: (args) => {
        const _user = userData.find(user => user.name === args.name)
        if (_user) {
            return _user
        } else {
            const _user = { id: userData.length + 1, name: args.name }
            userData.push(_user)
            return _user
        }
    },

    addForum: (args) => {
        const _forum = { id: forumData.length + 1, title: args.title, desc: args.desc, userID: args.userID }
        forumData.push(_forum)
        return _forum
    }

}

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true // for having the GraphiQL interface
}))

app.listen(4000, () => {
    console.log('Listening on 4000')
})
