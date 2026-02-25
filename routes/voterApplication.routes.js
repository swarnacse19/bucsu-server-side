const express = require("express");
const { client } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

const voterApplicationsCollection = client
    .db("BucsuDB")
    .collection("voterApplications");

const usersCollection = client
    .db("BucsuDB")
    .collection("users");

router.post("/", async (req, res) => {
    try {
        const data = req.body;

        if (!data.electionId) {
            return res.status(400).send({ message: "Election ID is required" });
        }

        const existing = await voterApplicationsCollection.findOne({
            email: data.email,
            electionId: data.electionId,
            status: "pending"
        });

        if (existing) {
            return res.status(400).send({ message: "You already have a pending application for this election." });
        }

        const user = await usersCollection.findOne({ email: data.email });
        if (user?.approvedElections?.includes(data.electionId)) {
            return res.status(400).send({ message: "You are already a voter for this election." });
        }

        const application = {
            ...data,
            status: "pending",
            appliedAt: new Date(),
        };

        const result = await voterApplicationsCollection.insertOne(application);

        res.send({
            success: true,
            insertedId: result.insertedId,
        });
    } catch (error) {
        res.status(500).send({ message: "Failed to submit application" });
    }
});


module.exports = router;