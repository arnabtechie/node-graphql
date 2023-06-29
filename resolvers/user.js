const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { ApolloError } = require("apollo-server");

const resolvers = {
  Query: {
    user: async (parent, { id }, context) => {
      try {
        const value = await User.findById(id);
        if (!value) {
          throw new ApolloError("User not found", "USER_NOT_FOUND", {
            statusCode: 400,
          });
        }
        return value;
      } catch (error) {
        throw new ApolloError("Failed to fetch user", error, {
          statusCode: 500,
        });
      }
    },
  },
  Mutation: {
    register: async (parent, { email, password }, context) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      return user;
    },
    login: async (parent, { email, password }, context) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid password");
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        "your-secret-key",
        {
          expiresIn: "1d",
        }
      );
      return token;
    },
  },
};

module.exports = resolvers;
