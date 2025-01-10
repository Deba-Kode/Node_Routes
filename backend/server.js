import express from "express";
import mongoose from "mongoose";
import User from "./model/Users.js";
import bcrypt from "bcrypt";

const PORT = 8080;
const app = express();
const mongodb_url = "mongodb://127.0.0.1:27017/nodePractice";

mongoose.connect(mongodb_url)
    .then(() => {
        console.log("Connected mongodb database succssfully......");
    })
    .catch((error) => {
        console.log("Error in connecting to mongodb database.....", error);
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Add single user Route
app.post("/add", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ username: username, email: email, password: hashedPassword });
        // const isExists = await User.findOne({ email: email });
        // if (isExists) {
        //     return res.status(404).json({ message: "User already exists...." });
        // }
        await user.save();
        return res.status(201).json({ message: "User added successfully...." });
    }
    catch (error) {
        return res.status(404).json({ message: "Error while adding the user to the database." });
    }
});

//Delete single user Route
app.post("/removeByID/:id", async (req, res) => {
    try {
        const email = req.params.id;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User does not exists...." });
        }
        await user.deleteOne();
        return res.status(201).json({ message: "User deleted successfully...." });
    }
    catch (error) {
        return res.status(404).json({ message: "Error while deleting the user from the database.", error: error });
    }
});

//Update the single user Route
app.post("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ email: id });
        if (!user) {
            return res.status(404).json({ message: "User does not exists...." });
        }
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashP = await bcrypt.hash(password, salt);
        await User.updateOne({ email: id }, { $set: { username, email, password: hashP } });
        return res.status(200).json({ message: "User updated successfully." });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error while updating the user in the database.", error: error.message,
        });
    }
});

//Delete single user Route
app.post("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ email: id });
        if (!user) {
            return res.status(404).json({ message: "User does not exists...." });
        }
        await user.deleteOne();
        res.status(200).json({ message: "User deleted successfully." });
    }
    catch (error) {
        return res.status(404).json({ message: "Error while deleting the user in the database.", error: error.message, });
    }
});

//Delete multiple user with similarities Route
app.post("/deleteMany/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await User.deleteMany({ email: id }, { $in: { email: id } });
        res.status(200).json({ message: "Users deleted successfully." });
    }
    catch (error) {
        return res.status(404).json({ message: "Error while deleting the users in the database.", error: error.message, });
    }
});

//Find all users Route
app.get("/allUsers", async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(404).json({ message: "Users not found...." });
        }
        return res.status(200).json({ users })
    }
    catch (error) {
        return res.status(404).json({ message: "Error while fetching all users from the database.", error: error.message, });
    }
});

//Pagination Route
app.get("/users/paginate", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find().skip((page - 1) * limit).limit(parseInt(limit));
        return res.status(200).json({ page, limit, users });
    }
    catch (error) {
        return res.status(404).json({ message: "Error in Paginating...", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at port number ${PORT}`)
});