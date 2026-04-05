const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { env } = require("./config/env");
const { notFound } = require("./middlewares/notFound");
const routes = require("./routes/route");

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);
app.use(notFound);

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
