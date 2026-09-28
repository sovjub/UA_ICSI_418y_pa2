require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient(process.env.MONGODB_URI);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
    try {
        const { f_name, l_name, username, password } = req.body;

        if (!f_name || !l_name || !username || !password) { // all fields required.
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const database = client.db("pa2"); // store entries here, this is the same table that login will use
        const users = database.collection("users");

        const existingUser = await users.findOne({ username: username }); // database.ifExists(primary_key) does this record exist already?

        if (existingUser) { // check
            return res.status(400).json({
                message: "Username already exists."
            });
        }

        await users.insertOne({ // "hey server, this is data I want to put away, I'll AWAIT for confirmation"
            f_name: f_name,
            l_name: l_name,
            username: username,
            password: password
        });

        res.status(201).json({ // :D
            message: "Signup successful."
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({ // server side issue
            message: "Server or database error."
        });
    }
});


app.post("/login", async (req, res) => {//  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = we receiev credentials from Login.jsx.
    try {
        const { username, password } = req.body;

        //  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = both fields have inputs?
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required."
            });
        }

        //  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = use same table in DB as used in signup
        const database = client.db("pa2");
        const users = database.collection("users");

        //  = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = search for username.
        const user = await users.findOne({ username: username }); // look in DB table if user exists

        if (!user) {
            return res.status(401).json({
                message: "Username does not exist."
            });
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = password check
        if (user.password !== password) { // the value associated with the key (user) does not match
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        res.status(200).json({ // :D
            message: "Login successful."
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server or database error."
        });
    }
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB"); // :D
    }
    catch (error) { // if anything goes wrong
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();

app.listen(9000, () => {
    console.log("Server running on port 9000");
});