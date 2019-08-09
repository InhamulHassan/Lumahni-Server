const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList
} = require("graphql");

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author Details",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Author ID",
      resolve: parsedXml => parsedXml.id[0]
    },
    name: {
      type: GraphQLString,
      description: "Author Name",
      resolve: parsedXml => parsedXml.name[0]
    },
    about: {
      type: GraphQLString,
      description: "Author Description",
      resolve: parsedXml => parsedXml.about[0]
    },
    image_url: {
      type: GraphQLString,
      description: "Author Goodreads Image URL Link",
      resolve: parsedXml => parsedXml.image_url[0]
    },
    large_image_url: {
      type: GraphQLString,
      description: "Author Goodreads Image URL Link: Large",
      resolve: parsedXml => parsedXml.large_image_url[0]
    },
    small_image_url: {
      type: GraphQLString,
      description: "Author Goodreads Image URL Link: Small",
      resolve: parsedXml => parsedXml.small_image_url[0]
    },
    books: {
      type: new GraphQLList(AuthorBookType),
      description: "List of Books by Author",
      args: {
        title: {
          type: GraphQLString,
          description:
            "Book Title to search for. It is case insensitive and supports regex."
        }
      },
      resolve: (parsedXml, { title: titleArg }) => {
        const booksList = parsedXml.books[0].book.map(
          ({
            id: [id],
            title: [title],
            isbn: [isbn],
            isbn13: [isbn13],
            image_url: [image_url],
            large_image_url: [large_image_url],
            small_image_url: [small_image_url],
            average_rating: [average_rating],
            link: [link],
            description: [description]
          }) => ({
            id,
            title,
            isbn,
            isbn13,
            image_url,
            large_image_url,
            small_image_url,
            average_rating,
            link,
            description
          })
        );

        if (titleArg) {
          const argAsRegex = new RegExp(titleArg, "i"); // TODO: sanitize user input i.e., titleArg

          return booksList.filter(({ title }) => argAsRegex.test(title));
        }

        return booksList;
      }
    },
    all_books: {
      type: new GraphQLList(AuthorBookType),
      description: "List of All the Books by the Author",
      args: {
        title: {
          type: GraphQLString,
          description:
            "Book Title to search for. It is case insensitive and supports regex."
        },
        page: {
          type: GraphQLInt,
          description: "Page Number to list books. Only supports integers."
        }
      },
      resolve: (parsedXml, { title, page }, context) => {
        const allBooksList = context.getAllBooksByAuthorIdLoader
          .load({
            id: parsedXml.id[0],
            page: page
          })
          .then(res => {
            return res.books[0].book.map(
              ({
                id: [id],
                title: [title],
                isbn: [isbn],
                isbn13: [isbn13],
                image_url: [image_url],
                large_image_url: [large_image_url],
                small_image_url: [small_image_url],
                average_rating: [average_rating],
                link: [link],
                description: [description]
              }) => ({
                id,
                title,
                isbn,
                isbn13,
                image_url,
                large_image_url,
                small_image_url,
                average_rating,
                link,
                description
              })
            );
          })
          .then(res => {
            if (title) {
              const argAsRegex = new RegExp(title, "i"); // TODO: sanitize user input i.e., titleArg

              return res.filter(({ title }) => argAsRegex.test(title));
            } else {
              return res;
            }
          });

        return allBooksList;
      }
    },
    total_books: {
      type: GraphQLInt,
      description: "Total Number of Books by Author",
      resolve: (parsedXml, args, context) => {
        return context.getAllBooksByAuthorIdLoader
          .load({
            id: parsedXml.id[0]
          })
          .then(res => {
            return res.books[0]["$"].total;
          });
      }
    }
  })
});

const AuthorBookType = new GraphQLObjectType({
  name: "Book",
  description: "Books by Author",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Book ID",
      resolve: parsedXml => parsedXml.id._ || parsedXml.id[0]
    },
    title: {
      type: GraphQLString,
      description: "Book Title"
    },
    isbn: {
      type: GraphQLString,
      description: "Book ISBN number"
    },
    isbn13: {
      type: GraphQLString,
      description: "Book ISBN13 number"
    },
    image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link"
    },
    large_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Large"
    },
    small_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Small"
    },
    average_rating: {
      type: GraphQLString,
      description: "Book Average Rating"
    },
    link: {
      type: GraphQLString,
      description: "Book Goodreads URL Link"
    },
    description: {
      type: GraphQLString,
      description: "Book Description"
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "Author Query from Goodreads API exposed via GraphQL",

    fields: () => ({
      author: {
        type: AuthorType,
        description: "Author of a book. Supports search by ID or Author Name",
        args: {
          id: {
            type: GraphQLInt,
            description: "Author ID to search for"
          },
          name: {
            type: GraphQLString,
            description: "Author Name to search for"
          }
        },
        resolve: (root, { id, name }, context) => {
          const hasName = !!name;
          const hasId = typeof id === "number";

          if (hasName && hasId) {
            return Promise.reject(
              new Error(
                "Provide either an Author Name or an Author ID, not both"
              )
            );
          }
          if (hasName) {
            return context.getAuthorByNameLoader.load(name);
          }
          if (hasId) {
            return context.getAuthorByIdLoader.load(id);
          }

          return Promise.reject(
            new Error("Author ID or Author Name argument must be provided")
          );
        }
      }
    })
  })
});
