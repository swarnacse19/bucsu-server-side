require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require('./routes/user.routes');
const electionRoutes = require('./routes/election.routes');
const noticeRoutes = require('./routes/notice.routes');

const { connectDB } = require("./config/db");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/elections", electionRoutes);
app.use("/notices", noticeRoutes);

app.get("/", (req, res) => {
  res.send("BUCSU server side is running");
});

app.listen(port, async () => {
  await connectDB();
  console.log(`BUCSU server is running on port ${port}`);
});
