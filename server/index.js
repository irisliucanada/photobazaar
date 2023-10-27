const express = require("express");
const mongoose = require("mongoose");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;

const purchaseRoutes = require("./src/routes/purchase.routes");
const tagRoutes = require("./src/routes/tag.routes");
const messageRoutes = require("./src/routes/message.routes");
const artworkRoutes = require("./src/routes/artworks.routes");
const userRouter = require("./src/routes/users.routes");
// const authRouter = require("./src/routes/auth.routes");

app.use(express.json());
app.use(cors());

app.use("/api/purchases", purchaseRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/users", userRouter);
// app.use("/api/auth", authRouter);

// connect Database
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "PhotoBazaar",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const socketController = require("./src/controllers/socket.controller");
const { createServer } = require("node:http");
const server = createServer(app);
socketController(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
