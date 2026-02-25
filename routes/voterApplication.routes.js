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

router.get("/", async (req, res) => {
    try {
        const { status, email, electionId } = req.query;

        let query = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (email) {
            query.email = email;
        }

        if (electionId) {
            query.electionId = electionId;
        }

        const applications = await voterApplicationsCollection
            .find(query)
            .sort({ appliedAt: -1 })
            .toArray();

        res.send(applications);
    } catch (error) {
        res.status(500).send({ message: "Failed to fetch applications" });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).send({ message: "Invalid status value" });
        }

        const application = await voterApplicationsCollection.findOne({ _id: new ObjectId(id) });
        if (!application) {
            return res.status(404).send({ message: "Application not found" });
        }

        
        if (status === "approved") {
           
            const userUpdateResult = await usersCollection.updateOne(
                { email: application.email },
                {
                    $addToSet: { approvedElections: application.electionId },
                    $set: { role: "voter" } 
                }
            );

            if (userUpdateResult.matchedCount === 0) {
                
            }
        }

        const result = await voterApplicationsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status,
                    reviewedAt: new Date(),
                },
            }
        );

        res.send({
            success: true,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update application status" });
    }
});

module.exports = router;