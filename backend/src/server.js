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
    origin: [
      "http://13.232.130.132",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);
app.use(notFound);

const startServer = async () => {
  try {
    await connectDB();

    const PORT = env.port || process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();