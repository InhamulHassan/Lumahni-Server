const { nophoto_url } = require("../helpers/get_nophoto_url");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList
} = require("graphql");

const SearchType = new GraphQLObjectType({
  name: "Search",
  description: "Search Query Details",
  fields: () => ({
    query: {
      type: GraphQLString,
      description: "Search Query String",
      resolve: parsedXml => parsedXml.query[0]
    },
    results_start: {
      type: GraphQLString,
      description: "Search Results Start Value",
      resolve: parsedXml => parsedXml["results-start"][0]
    },
    results_end: {
      type: GraphQLString,
      description: "Search Results End Value",
      resolve: parsedXml => parsedXml["results-end"][0]
    },
    total_results: {
      type: GraphQLString,
      description: "Total Search Results Count",
      resolve: parsedXml => parsedXml["total-results"][0]
    },
    query_time: {
      type: GraphQLString,
      description: "Search Query Time",
      resolve: parsedXml => parsedXml["query-time-seconds"][0]
    },
    works: {
      type: new GraphQLList(WorkType),
      description: "List of Works returned by the Search Query",
      args: {
        id: {
          type: GraphQLInt,
          description: "Work Id to search for."
        }
      },
      resolve: (parsedXml, { id: workIdArg }) => {
        const worksList = parsedXml.results[0].work.map(
          ({
            id: [id],
            average_rating: [average_rating],
            books_count: [books_count],
            best_book: [best_book]
          }) => ({
            id,
            average_rating,
            books_count,
            best_book
          })
        );

        if (workIdArg) {
          const argAsRegex = new RegExp(workIdArg, "i"); // TODO: sanitize user input i.e., titleArg

          return worksList.filter(({ id }) => argAsRegex.test(id));
        }

        return worksList;
      }
    }
  })
});

const WorkType = new GraphQLObjectType({
  name: "Work",
  description: "Work returned by the Search Query",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Work ID",
      resolve: parsedXml => parsedXml.id._
    },
    average_rating: {
      type: GraphQLString,
      description: "Average Rating for the Work",
      resolve: parsedXml => parsedXml.average_rating
    },
    books_count: {
      type: GraphQLInt,
      description: "Total Number of Book available in the Works",
      resolve: parsedXml => parsedXml.books_count._
    },
    best_book: {
      type: new GraphQLList(BookType),
      description: "Best Book that is listed for a particlar work",
      resolve: (parsedXml, args, context) => {
          // the reason for surrounding with brackets is because the map is function of iterable (Array)
          // but the parsedXml is returning a JSON object without the brackets (due to some inconsistencies with parse XML )
        return [parsedXml.best_book].map(
          ({
            id: [id],
            title: [title],
            image_url: [image_url],
            small_image_url: [small_image_url],
            author: [author]
          }) => ({
            id,
            title,
            image_url,
            small_image_url,
            author
          })
        );
      }
    }
  })
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "Book Details",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Book ID",
      resolve: parsedXml => parsedXml.id._
    },
    title: {
      type: GraphQLString,
      description: "Book Title",
      resolve: parsedXml => parsedXml.title
    },
    image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link",
      resolve: parsedXml => parsedXml.image_url
    },
    small_image_url: {
      type: GraphQLString,
      description: "Book Goodreads Image URL Link: Small",
      resolve: parsedXml => parsedXml.small_image_url
    },
    author: {
      type: new GraphQLList(BookAuthorType),
      description: "Author who wrote the Book",
      resolve: (parsedXml, { id, name }) => {
        return [parsedXml.author].map(({ id: [id], name: [name] }) => ({
          id,
          name
        }));
      }
    }
  })
});

const BookAuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author Details",
  fields: () => ({
    id: {
      type: GraphQLInt,
      description: "Goodreads Author ID",
      resolve: parsedXml => parsedXml.id._
    },
    name: {
      type: GraphQLString,
      description: "Author Name"
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "Book Search Query from Goodreads API exposed via GraphQL",
    fields: () => ({
      search: {
        type: SearchType,
        description:
          "Search Query. Supports seacrh by Book Title, ISBN, Genre, and Author Name",
        args: {
          title: {
            type: GraphQLString,
            description: "Book Title to search for."
          },
          isbn: {
            type: GraphQLString,
            description: "Book ISBN to search for."
          },
          genre: {
            type: GraphQLString,
            description: "Book Genre to search for."
          },
          author_name: {
            type: GraphQLString,
            description: "Author Name to search for."
          },
          page: {
            type: GraphQLInt,
            description:
              "Page Number to list search reults. Only supports integers."
          }
        },
        resolve: (root, { title, isbn, genre, author_name, page }, context) => {
          const hasTitle = !!title;
          const hasIsbn = !!isbn;
          const hasGenre = !!genre;
          const hasAuthorName = !!author_name;

          if (hasTitle && hasIsbn && hasGenre && hasAuthorName) {
            return Promise.reject(
              new Error(
                "Provide either a Book Title, Book ISBN, Book Genre, or Author Name individually, not together"
              )
            );
          }
          if ((hasIsbn || hasGenre || hasAuthorName) && hasTitle) {
            return Promise.reject(
              new Error(
                "Do not provide either a Book ISBN, Book Genre or Author Name together with Book Title"
              )
            );
          }
          if ((hasTitle || hasGenre || hasAuthorName) && hasIsbn) {
            return Promise.reject(
              new Error(
                "Do not provide either a Book Title, Book Genre or Author Name together with Book ISBN"
              )
            );
          }
          if ((hasTitle || hasIsbn || hasAuthorName) && hasGenre) {
            return Promise.reject(
              new Error(
                "Do not provide either a Book Title, Book ISBN or Author Name together with Book Genre"
              )
            );
          }
          if ((hasTitle || hasIsbn || hasGenre) && hasAuthorName) {
            return Promise.reject(
              new Error(
                "Do not provide either a Book Title, Book ISBN  or Book Genre together with Author Name"
              )
            );
          }
          if (hasTitle) {
            return context.searchBooksByTitleLoader.load({
              title: title,
              page: page
            });
          }
          if (hasIsbn) {
            return context.searchBooksByISBNLoader.load({
              isbn: isbn,
              page: page
            });
          }
          if (hasGenre) {
            return context.searchBooksByGenreLoader.load({
              genre: genre,
              page: page
            });
          }
          if (hasAuthorName) {
            return context.searchBooksByAuthorNameLoader.load({
              author_name: author_name,
              page: page
            });
          }

          return Promise.reject(
            new Error(
              "Goodreads Book Title, Book ISBN, Book Genre or an Author Name argument must be provided"
            )
          );
        }
      }
    })
  })
});
