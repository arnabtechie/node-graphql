const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

mongoose
  .connect("mongodb://localhost:27017/gql-node", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema/user.graphql"),
  "utf-8"
);

const resolvers = require("./resolvers/user");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    const customError = {
      message: error.message,
      code: error.originalError.extensions.code,
    };

    return customError;
  },
  debug: false,
  context: ({ req }) => {
    const headers = req.headers;
    const authorization = req.headers.authorization;
    return { headers, authorization };
  },
});

const startApolloServer = async () => {
  await server.start();

  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server running at port ${port} & ${server.graphqlPath}`);
  });
};

startApolloServer().catch((error) => {
  console.error("Error starting Apollo Server", error);
});
