const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

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
    me: (_root, _args, { currentUser }) => currentUser,
  },
  Mutation: {
    addBook: async (_, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

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
    editAuthor: async (_, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

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
    createUser: async (_, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre });

      try {
        await user.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: username,
            error,
          },
        });
      }

      return user;
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });

      if (!user || password !== "secret") {
        // hardcoded password for now
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = { username: user.username, id: user._id };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("_resetDatabase is only available in test mode");
      }

      await Author.deleteMany({});
      await Book.deleteMany({});
      await User.deleteMany({});
      return true;
    },
  },
};

module.exports = resolvers;
