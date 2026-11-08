// PA4: User stories and project backlog. All story routes are scoped to a project.
const { ObjectId } = require("mongodb");

const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["To Do", "In Progress", "Done"];

function isObjectId(value) {
    return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

function isNonblank(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function registerStoryRoutes(app, client) {
    // Keep PA4 in the same database as PA3's users/projects/memberships.
    const database = () => client.db("pa2");

    async function getProject(req, res) {
        if (!isObjectId(req.params.projectId)) {
            res.status(400).json({ message: "Invalid project ID." });
            return null;
        }

        const project = await database().collection("projects").findOne({
            _id: new ObjectId(req.params.projectId)
        });
        if (!project) {
            res.status(404).json({ message: "Project not found." });
            return null;
        }
        return project;
    }

    // Validate assigned users on the server, not merely in the React dropdown.
    async function validateAssignment(project, assignedId) {
        if (assignedId === null) return null; // Unassigned is always permitted.

        if (!isObjectId(assignedId)) {
            return "Assigned member must be a valid user or Unassigned.";
        }

        const userId = new ObjectId(assignedId);
        const user = await database().collection("users").findOne({ _id: userId });
        if (!user) return "Assigned user does not exist.";

        const membership = await database().collection("projectMemberships").findOne({
            project_id: project._id,
            user_id: userId
        });
        const isLead = project.project_lead_id.toString() === userId.toString();
        if (!membership && !isLead) {
            return "Assigned user must be a member of this project.";
        }
        return null;
    }

    // A shared error wrapper ensures unexpected database failures return JSON.
    function route(handler) {
        return async (req, res) => {
            try {
                await handler(req, res);
            } catch (error) {
                console.error("User story error:", error);
                if (!res.headersSent) {
                    res.status(500).json({ message: "A database error occurred." });
                }
            }
        };
    }

    app.get("/api/projects/:projectId/stories", route(async (req, res) => {
        const project = await getProject(req, res);
        if (!project) return;

        // No status filter: Done stories remain visible in the backlog.
        const stories = await database().collection("UserStories")
            .find({ project_id: project._id }).toArray();
        res.json(stories);
    }));

    app.post("/api/projects/:projectId/stories", route(async (req, res) => {
        const project = await getProject(req, res);
        if (!project) return;

        const { title, description, priority, assigned_user_id = null } = req.body || {};
        if (!isNonblank(title) || !isNonblank(description) || !PRIORITIES.includes(priority)) {
            return res.status(400).json({
                message: "Title, description, and valid priority are required."
            });
        }

        const assignmentError = await validateAssignment(project, assigned_user_id);
        if (assignmentError) return res.status(400).json({ message: assignmentError });

        const story = {
            project_id: project._id,
            title: title.trim(),
            description: description.trim(),
            priority,
            status: "To Do", // Server decides initial status, even if request sends another one.
            assigned_user_id: assigned_user_id === null ? null : new ObjectId(assigned_user_id)
        };

        const result = await database().collection("UserStories").insertOne(story);
        res.status(201).json({ message: "Story created.", story: { _id: result.insertedId, ...story } });
    }));

    app.put("/api/projects/:projectId/stories/:storyId", route(async (req, res) => {
        const project = await getProject(req, res);
        if (!project) return;

        const { storyId } = req.params;
        if (!isObjectId(storyId)) {
            return res.status(400).json({ message: "Invalid story ID." });
        }

        // A story must never move to another project.
        if (req.body?.project_id !== undefined && req.body.project_id !== project._id.toString()) {
            return res.status(400).json({ message: "A story cannot change projects." });
        }

        const stories = database().collection("UserStories");
        const filter = { _id: new ObjectId(storyId), project_id: project._id };
        if (!await stories.findOne(filter)) {
            return res.status(404).json({ message: "Story not found in this project." });
        }

        const { title, description, priority, status, assigned_user_id = null } = req.body || {};
        if (!isNonblank(title) || !isNonblank(description) ||
            !PRIORITIES.includes(priority) || !STATUSES.includes(status)) {
            return res.status(400).json({
                message: "Title, description, valid priority, and valid status are required."
            });
        }

        const assignmentError = await validateAssignment(project, assigned_user_id);
        if (assignmentError) return res.status(400).json({ message: assignmentError });

        const changes = {
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            assigned_user_id: assigned_user_id === null ? null : new ObjectId(assigned_user_id)
        };
        await stories.updateOne(filter, { $set: changes });
        res.json({ message: "Story updated." });
    }));

    app.delete("/api/projects/:projectId/stories/:storyId", route(async (req, res) => {
        const project = await getProject(req, res);
        if (!project) return;
        if (!isObjectId(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID." });
        }

        const result = await database().collection("UserStories").deleteOne({
            _id: new ObjectId(req.params.storyId),
            project_id: project._id
        });
        if (!result.deletedCount) {
            return res.status(404).json({ message: "Story not found in this project." });
        }
        res.json({ message: "Story deleted." });
    }));
}

module.exports = registerStoryRoutes;
