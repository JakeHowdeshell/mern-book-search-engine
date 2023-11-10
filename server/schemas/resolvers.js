const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

// make sure to review and update accordingly
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("books");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw AuthenticationError;
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw AuthenticationError;
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { book }, context) => {
        // You can access individual properties like book.author, book.description, etc.
        const { author, description, title, bookId, image, link } = book;
  
        // Perform your logic here, like saving the book to the database
        const user = await User.findById(context.user.id);
  
        // Add the book to the user's list or save it as needed
        // For example:
        user.books.push({
          author,
          description,
          title,
          bookId,
          image,
          link,
        });
  
        await user.save();
  
        return user;
      },
      removeBook: async (_, { bookId }, context) => {
        // Assuming you're using Mongoose, find the user by their ID
        const user = await User.findById(context.user.id);
  
        if (!user) {
          throw new Error('User not found');
        }
  
        // Remove the book with the given bookId from the user's books array
        user.books = user.books.filter((book) => book.bookId !== bookId);
  
        // Save the updated user
        await user.save();
  
        return user;
      },
  },
};

module.exports = resolvers;
