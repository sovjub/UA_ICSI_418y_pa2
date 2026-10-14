require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

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

app.get("/api/users", async (req, res) => { //obtain a list of all known Users
    try {
        const database = client.db("pa2");

        const users = await database.collection("users")
            .find({}, { projection: { _id: 1, username: 1 } })
            .toArray();

        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not retrieve users."
        });
    }
});

app.post("/api/projects", async (req, res) => {// crete a project and automatically add its lead as a member.
    try {
        const { name, description, status, project_lead_id } = req.body;

        // Validate required fields.
        if (
            typeof name !== "string" || !name.trim() ||
            typeof description !== "string" || !description.trim() ||
            !["Planning", "Active", "Completed"].includes(status) ||
            !ObjectId.isValid(project_lead_id)
        ) {
            return res.status(400).json({
                message: "Invalid or missing project information."
            });
        }

        const database = client.db("pa2");
        const users = database.collection("users");
        const projects = database.collection("projects");
        const memberships = database.collection("projectMemberships");

        const leadId = new ObjectId(project_lead_id);

        // Confirm that the selected lead exists.
        const lead = await users.findOne({ _id: leadId });

        if (!lead) {
            return res.status(404).json({
                message: "Selected project lead does not exist."
            });
        }

        // create the project.
        const result = await projects.insertOne({
            name: name.trim(),
            description: description.trim(),
            status: status,
            project_lead_id: leadId
        });

        // auto add the assigned project lead lead as a project member.
        await memberships.insertOne({
            project_id: result.insertedId,
            user_id: leadId
        });

        res.status(201).json({
            message: "Project created successfully.",
            project_id: result.insertedId
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not create project."
        });
    }
});

app.get("/api/projects", async (req, res) => { // returns all known projects, similar to the getUsers function
    try {
        const database = client.db("pa2");

        const projects = await database.collection("projects")
            .find({})
            .toArray();

        res.status(200).json(projects);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not retrieve projects."
        });
    }
});

app.get("/api/projects/:projectId/members", async (req, res) => {// returns all members given the selected project.
    try {
        const { projectId } = req.params;

        if (!ObjectId.isValid(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID."
            });
        }

        const database = client.db("pa2");
        const projectObjectId = new ObjectId(projectId);

        const project = await database.collection("projects")
            .findOne({ _id: projectObjectId });

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        const members = await database.collection("projectMemberships")
            .find({ project_id: projectObjectId })
            .toArray();

        res.status(200).json(members);
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not retrieve project members."
        });
    }
});

app.post("/api/projects/:projectId/members", async (req, res) => {// add an existing registered user to a project.
    try {
        const { projectId } = req.params;
        const { user_id } = req.body;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(user_id)) {
            return res.status(400).json({
                message: "Invalid project or user ID."
            });
        }

        const database = client.db("pa2");

        const projects = database.collection("projects");
        const users = database.collection("users");
        const memberships = database.collection("projectMemberships");

        const projectObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(user_id);

        // verify that the project exists.
        const project = await projects.findOne({
            _id: projectObjectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        // verify that the user exists.
        const user = await users.findOne({
            _id: userObjectId
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // prevent duplicate memberships.
        const existingMembership = await memberships.findOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        if (existingMembership) {
            return res.status(409).json({
                message: "User is already a member of this project."
            });
        }

        await memberships.insertOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        res.status(201).json({
            message: "Member added successfully."
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not add project member."
        });
    }
});

app.delete("/api/projects/:projectId/members/:userId", async (req, res) => { // Remove a member, but never remove the project lead.
    try {
        const { projectId, userId } = req.params;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: "Invalid project or user ID."
            });
        }

        const database = client.db("pa2");

        const projects = database.collection("projects");
        const memberships = database.collection("projectMemberships");

        const projectObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(userId);

        // Verify that the project exists
        const project = await projects.findOne({
            _id: projectObjectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        // the project lead cannot be removed
        if (project.project_lead_id.toString() === userObjectId.toString()) {
            return res.status(403).json({
                message: "The project lead cannot be removed."
            });
        }

        // rwmove the matching membership
        const result = await memberships.deleteOne({
            project_id: projectObjectId,
            user_id: userObjectId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Membership not found."
            });
        }

        res.status(200).json({
            message: "Member removed successfully."
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not remove project member."
        });
    }
});



// =======================================================================================================
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