const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const noticesCollection = client
  .db("BucsuDB")
  .collection("notices");

router.post("/", async (req, res) => {
  try {
    const notice = req.body;

    if (!notice.title || !notice.content) {
      return res.status(400).send({ message: "Title and content are required" });
    }

    const newNotice = {
      title: notice.title,
      content: notice.content,
      type: notice.type || "general", // general | election | urgent
      createdAt: new Date(),
    };

    const result = await noticesCollection.insertOne(newNotice);

    res.send({
      message: "Notice published successfully",
      inserted: true,
      result,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to publish notice" });
  }
});

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 0;

  const notices = await noticesCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  res.send(notices);
});


// router.get("/:id", async (req, res) => {
//   const id = req.params.id;

//   const notice = await noticesCollection.findOne({
//     _id: new ObjectId(id),
//   });

//   res.send(notice);
// });


// router.delete("/:id", async (req, res) => {
//   const id = req.params.id;

//   const result = await noticesCollection.deleteOne({
//     _id: new ObjectId(id),
//   });

//   res.send(result);
// });

module.exports = router;
