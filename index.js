require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require('./routes/user.routes');
const electionRoutes = require('./routes/election.routes');
const noticeRoutes = require('./routes/notice.routes');
const uploadRoutes = require('./routes/uploads.routes');
const applicationRoutes = require('./routes/application.routes');
const candidatesRoutes = require('./routes/candidates.routes');
const checkRoutes = require('./routes/check.routes');
const votesRoutes = require('./routes/votes.routes');
const countRoutes = require('./routes/count.routes');
const resultsRoutes = require('./routes/publish.routes');
const studentRoutes = require('./routes/student.routes');

const { connectDB } = require("./config/db");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);
app.use("/elections", electionRoutes);
app.use("/notices", noticeRoutes);
app.use("/candidate-applications", applicationRoutes);
app.use("/candidates", candidatesRoutes);
app.use("/check", checkRoutes);
app.use("/votes", votesRoutes);
app.use("/count", countRoutes);
app.use("/results", resultsRoutes);
app.use("/department-students", studentRoutes);

app.get("/", (req, res) => {
  res.send("BUCSU server side is running");
});

app.listen(port, async () => {
  await connectDB();
  console.log(`BUCSU server is running on port ${port}`);
});
