const { nophoto_url } = require("../helpers/get_nophoto_url");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList
} = require("graphql");

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "Book Details",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Book ID",
      resolve: parsedXml => parsedXml.id[0]
    },
    title: {
      type: GraphQLString,
      description: "Book Title",
      resolve: parsedXml => parsedXml.title[0]
    },
    isbn: {
      type: GraphQLString,
      description: "Book ISBN Number",
      resolve: parsedXml => parsedXml.isbn[0]
    },
    isbn13: {
      type: GraphQLString,
      description: "Book ISBN13 Number",
      resolve: parsedXml => parsedXml.isbn13[0]
    },
    average_rating: {
      type: GraphQLString,
      description: "Book Average Rating",
      resolve: parsedXml => parsedXml.average_rating[0]
    },
    link: {
      type: GraphQLString,
      description: "Book Goodreads URL Link",
      resolve: xml => xml.link[0]
    },
    description: {
      type: GraphQLString,
      description: "Book Description",
      resolve: xml => xml.description[0]
    },
    image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link",
      resolve: parsedXml => parsedXml.image_url[0]
    },
    large_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Large",
      resolve: parsedXml => parsedXml.large_image_url[0]
    },
    small_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Small",
      resolve: parsedXml => parsedXml.small_image_url[0]
    },
    num_pages: {
      type: GraphQLInt,
      description: "Number of Pages in the Book",
      resolve: parsedXml => parsedXml.num_pages[0]
    },
    publisher: {
      type: GraphQLString,
      description: "Book Publisher",
      resolve: parsedXml => parsedXml.publisher[0]
    },
    publication_year: {
      type: GraphQLInt,
      description: "Book Publication Year",
      resolve: parsedXml => parsedXml.publication_year[0]
    },
    language_code: {
      type: GraphQLString,
      description: "Book Language",
      resolve: parsedXml => parsedXml.language_code[0]
    },
    shelf_names: {
      type: new GraphQLList(BookShelfType),
      description: "List of Shelves the Book is featured in",
      resolve: parsedXml => parsedXml.popular_shelves[0].shelf
    },
    authors: {
      type: new GraphQLList(BookAuthorType),
      description: "List of Authors who wrote the Book",
      args: {
        name: {
          type: GraphQLString,
          description:
            "Author Name to search for. It is case insensitive and supports regex."
        }
      },
      resolve: (parsedXml, { name: authorNameArg }) => {
        const authorsList = parsedXml.authors[0].author.map(
          ({
            id: [id],
            name: [name],
            role: [role],
            average_rating: [average_rating],
            image_url: [image_url],
            small_image_url: [small_image_url]
          }) => ({
            id,
            name,
            role,
            average_rating,
            image_url,
            small_image_url
          })
        );

        if (authorNameArg) {
          const argAsRegex = new RegExp(authorNameArg, "i"); // TODO: sanitize user input i.e., titleArg

          return authorsList.filter(({ name }) => argAsRegex.test(name));
        }

        return authorsList;
      }
    },
    similar_books: {
      type: new GraphQLList(SimilarBookType),
      description: "List of Similar Books",
      args: {
        title: {
          type: GraphQLString,
          description:
            "Book Title to search for. It is case insensitive and supports regex."
        }
      },
      resolve: (parsedXml, { title: titleArg }) => {
        const booksList = parsedXml.similar_books[0].book.map(
          ({
            id: [id],
            title: [title],
            isbn: [isbn],
            isbn13: [isbn13],
            image_url: [image_url],
            small_image_url: [small_image_url],
            average_rating: [average_rating],
            link: [link],
            authors: [authors]
          }) => ({
            id,
            title,
            isbn,
            isbn13,
            image_url,
            small_image_url,
            average_rating,
            link,
            authors
          })
        );

        if (titleArg) {
          const argAsRegex = new RegExp(titleArg, "i"); // TODO: sanitize user input i.e., titleArg

          return booksList.filter(({ title }) => argAsRegex.test(title));
        }

        return booksList;
      }
    }
  })
});

const BookShelfType = new GraphQLObjectType({
  name: "BookShelf",
  description: "Popular Goodread Book Shelves",
  fields: () => ({
    name: {
      type: GraphQLString,
      description: "Book Shelf Name",
      resolve: response => response["$"].name
    },
    count: {
      type: GraphQLInt,
      description: "Book's Shelf Popularity Count",
      resolve: response => response["$"].count
    }
  })
});

const BookAuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author Details",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Author ID"
    },
    name: {
      type: GraphQLString,
      description: "Author Name"
    },
    role: {
      type: GraphQLString,
      description: "Author Role"
    },
    average_rating: {
      type: GraphQLString,
      description: "Book Average Rating"
    },
    image_url: {
      type: GraphQLString,
      description: "Author Goodreads Image URL Link",
      resolve: parsedXml => {
        return parsedXml.image_url["$"].nophoto == "false"
          ? parsedXml.image_url._.trim()
          : nophoto_url;
      }
    },
    small_image_url: {
      type: GraphQLString,
      description: "Author Goodreads Image URL Link: Small",
      resolve: parsedXml => {
        return parsedXml.small_image_url["$"].nophoto == "false"
          ? parsedXml.small_image_url._.trim()
          : nophoto_url;
      }
    }
  })
});

const SimilarBookType = new GraphQLObjectType({
  name: "SimilarBook",
  description: "Book Similar to the fetched Book",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Book ID"
    },
    title: {
      type: GraphQLString,
      description: "Book Title"
    },
    isbn: {
      type: GraphQLString,
      description: "Book ISBN Number"
    },
    isbn13: {
      type: GraphQLString,
      description: "Book ISBN13 Number"
    },
    average_rating: {
      type: GraphQLString,
      description: "Book Average Rating"
    },
    link: {
      type: GraphQLString,
      description: "Book Goodreads URL Link"
    },
    image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link"
    },
    small_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Small"
    },
    authors: {
      type: new GraphQLList(BookAuthorType),
      description: "List of Authors who wrote the Book",
      args: {
        name: {
          type: GraphQLString,
          description:
            "Author Name to search for. It is case insensitive and supports regex."
        }
      },
      resolve: (parsedXml, { name: authorNameArg }) => {
        const authorsList = parsedXml.authors.author.map(
          ({
            id: [id],
            name: [name],
            link: [link]
          }) => ({
            id,
            name,
            link
          })
        );

        if (authorNameArg) {
          const argAsRegex = new RegExp(authorNameArg, "i"); // TODO: sanitize user input i.e., titleArg

          return authorsList.filter(({ name }) => argAsRegex.test(name));
        }

        return authorsList;
      }
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "Book Query from Goodreads API exposed via GraphQL",

    fields: () => ({
      book: {
        type: BookType,
        description:
          "Book Details. Supports book by Title, ISBN, Author Name, or Author Id",
        args: {
          id: {
            type: GraphQLInt,
            description: "Goodreads Book ID to search for"
          },
          isbn: {
            type: GraphQLString,
            description: "Book ISBN to search for"
          },
          title: {
            type: GraphQLString,
            description: "Book Title to search for"
          },
          author_name: {
            type: GraphQLString,
            description: "Author Name to search for"
          }
        },
        resolve: (root, { id, isbn, title, author_name }, context) => {
          const hasId = typeof id === "number";
          const hasIsbn = !!isbn;
          const hasTitle = !!title;
          const hasAuthorName = !!author_name;

          if (hasId && hasIsbn) {
            return Promise.reject(
              new Error(
                "Provide either a Goodreads Book ID or Book ISBN not both"
              )
            );
          }
          if ((hasId || hasIsbn) && hasTitle) {
            return Promise.reject(
              new Error(
                "Do not provide either a Goodreads Book ID or Book ISBN together with Book Title"
              )
            );
          }
          if ((hasId || hasIsbn) && hasAuthorName) {
            return Promise.reject(
              new Error(
                "Do not provide either a Goodreads Book ID or Book ISBN together with Author Name"
              )
            );
          }
          if (hasAuthorName && !hasTitle) {
            return Promise.reject(
              new Error(
                "Do not provide the Author Name without a Book Title, the author name is only needed for accuracy"
              )
            );
          }
          if (hasId) {
            return context.getBookByGRIdLoader.load(id);
          }
          if (hasIsbn) {
            return context.getBookByISBNLoader.load(isbn);
          }
          if (hasTitle && hasAuthorName) {
            return context.getBookByTitleLoader.load({
              title: title,
              author_name: author_name
            });
          } else if (hasTitle) {
            return context.getBookByTitleLoader.load({
              title: title,
              author_name: ""
            });
          }

          return Promise.reject(
            new Error(
              "Goodreads Book ID, Book ISBN, Book Title or an Author Name argument must be provided"
            )
          );
        }
      }
    })
  })
});
