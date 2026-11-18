const { GraphQLError } = require("graphql");
const Book = require("./models/book");
const Author = require("./models/author");

const resolvers = {
  Book: {
    author: async ({ author }) => Author.findOne({ _id: author }),
  },
  Author: {
    bookCount: async ({ _id }) => {
      const books = await Book.find({ author: _id });
      return books.length;
    },
  },
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (_, { author, genre }) => {
      const filter = {};

      if (author) {
        const authorInDb = await Author.findOne({ name: author });
        filter.author = authorInDb && authorInDb._id;
      }

      if (genre) filter.genres = genre;

      return Book.find(filter);
    },
    allAuthors: async () => Author.find({}),
  },
  Mutation: {
    addBook: async (_, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }

      return book;
    },
    editAuthor: async (_, { name, setBornTo }) => {
      const author = await Author.findOne({ name });

      if (!author) {
        return null;
      }

      author.born = setBornTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: setBornTo,
            error,
          },
        });
      }

      return author;
    },
  },
};

module.exports = resolvers;
