const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLInt,
    GraphQLString
} = require('graphql');

const {
    AuthorType
} = require("./author_type");

module.exports = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: 'Goodreads API exposed via graphql',

        fields: () => ({
            author: {
                type: AuthorType,
                description: 'Author of a book. Supports search by ID or Author Name',
                args: {
                    id: {
                        type: GraphQLInt,
                        description: 'Author ID to search for'
                    },
                    name: {
                        type: GraphQLString,
                        description: 'Author Name to search for'
                    }
                },
                resolve: (root, {
                    id,
                    name
                }, {
                    loaders: {
                        getAuthorByNameLoader,
                        getAuthorByIdLoader
                    }
                }) => {
                    const hasName = !!name
                    const hasId = typeof id === 'number'

                    if (hasName && hasId) {
                        return Promise.reject(new Error('Provide either an Author Name or an Author ID, not both'))
                    }
                    if (hasName) {
                        return getAuthorByNameLoader.load(name)
                    }
                    if (hasId) {
                        return getAuthorByIdLoader.load(id)
                    }

                    return Promise.reject(new Error('Author ID or Author Name argument must be provided'))
                }
            }
        })
    }),
});
