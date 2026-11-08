import { useEffect, useState } from "react";

const API = "http://localhost:9000";
const PRIORITIES = ["High", "Medium", "Low"];
const STATUSES = ["To Do", "In Progress", "Done"];

const emptyForm = () => ({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    assigned_user_id: ""
});

async function readResponse(response) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
}

function ProjectBacklog() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);
    const [stories, setStories] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [formMode, setFormMode] = useState(null); // null, "create", or "edit"
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    async function fetchProjects() {
        try {
            const response = await fetch(`${API}/api/projects`);
            setProjects(await readResponse(response));
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        // Initial lists (also refresh projects when the selector receives focus).
        async function loadInitialLists() {
            try {
                const [projectsResponse, usersResponse] = await Promise.all([
                    fetch(`${API}/api/projects`),
                    fetch(`${API}/api/users`)
                ]);
                const [projectList, userList] = await Promise.all([
                    readResponse(projectsResponse), readResponse(usersResponse)
                ]);
                setProjects(projectList);
                setUsers(userList);
            } catch (error) {
                setMessage(error.message);
            }
        }
        loadInitialLists();
    }, []);

    useEffect(() => {
        if (!projectId) return;
        // Ignore stale responses if the user switches projects while requests are pending.
        const controller = new AbortController();
        async function loadSelectedProject() {
            try {
                const [storiesResponse, membersResponse, usersResponse] = await Promise.all([
                    fetch(`${API}/api/projects/${projectId}/stories`, { signal: controller.signal }),
                    fetch(`${API}/api/projects/${projectId}/members`, { signal: controller.signal }),
                    fetch(`${API}/api/users`, { signal: controller.signal })
                ]);
                const [storyList, memberList, userList] = await Promise.all([
                    readResponse(storiesResponse), readResponse(membersResponse), readResponse(usersResponse)
                ]);
                if (controller.signal.aborted) return;
                setStories(storyList);
                setMembers(memberList);
                setUsers(userList);
            } catch (error) {
                if (!controller.signal.aborted) setMessage(error.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadSelectedProject();
        return () => controller.abort();
    }, [projectId]);

    function changeProject(event) {
        setProjectId(event.target.value);
        // PA4: switching projects must clear old stories and any open edit form.
        setStories([]);
        setMembers([]);
        closeForm();
        setMessage("");
        setLoading(Boolean(event.target.value));
    }

    function closeForm() {
        setFormMode(null);
        setEditingId(null);
        setForm(emptyForm());
    }

    function createStory() {
        setForm(emptyForm());
        setEditingId(null);
        setFormMode("create");
        setMessage("");
    }

    function editStory(story) {
        setForm({
            title: story.title,
            description: story.description,
            priority: story.priority,
            status: story.status,
            assigned_user_id: story.assigned_user_id || ""
        });
        setEditingId(story._id);
        setFormMode("edit");
        setMessage("");
    }

    function updateField(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    function username(userId) {
        if (!userId) return "Unassigned";
        const user = users.find((entry) => entry._id === userId);
        return user ? user.username : "Unknown user";
    }

    // Dropdown uses only project members (including its lead), never all users.
    const memberUsers = members
        .map((membership) => users.find((user) => user._id === membership.user_id))
        .filter(Boolean);

    async function reloadStories() {
        const response = await fetch(`${API}/api/projects/${projectId}/stories`);
        setStories(await readResponse(response));
    }

    async function saveStory(event) {
        event.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            setMessage("Title and description cannot be blank.");
            return;
        }

        const isEdit = formMode === "edit";
        const url = isEdit
            ? `${API}/api/projects/${projectId}/stories/${editingId}`
            : `${API}/api/projects/${projectId}/stories`;
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority,
            assigned_user_id: form.assigned_user_id || null,
            ...(isEdit ? { status: form.status } : {})
        };

        setSaving(true);
        setMessage("");
        try {
            const result = await readResponse(await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }));
            await reloadStories();
            closeForm();
            setMessage(result.message);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteStory(story) {
        // Canceling this confirmation makes no request and leaves the DB unchanged.
        if (!window.confirm(`Delete the story "${story.title}"?`)) return;
        setSaving(true);
        setMessage("");
        try {
            const result = await readResponse(await fetch(
                `${API}/api/projects/${projectId}/stories/${story._id}`,
                { method: "DELETE" }
            ));
            await reloadStories();
            if (editingId === story._id) closeForm();
            setMessage(result.message);
        } catch (error) {
            setMessage(error.message);
        } finally {
            setSaving(false);
        }
    }

    return (// Here we have the HTML stuff
        <div className="backlog">
            <h2>Project Backlog</h2>
            <label htmlFor="backlog-project">Select Project:</label>
            <select
                id="backlog-project"
                value={projectId}
                onChange={changeProject}
                onFocus={fetchProjects}
                disabled={saving}
            >
                <option value="">Select a project</option>
                {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                ))}
            </select>

            {projectId && (
                <>
                    <div className="backlog-heading">
                        <h3>User Stories</h3>
                        <button type="button" disabled={saving || loading} onClick={createStory}>
                            New Story
                        </button>
                    </div>
                    {loading ? (
                        <p>Loading stories...</p>
                    ) : stories.length === 0 ? (
                        <p>No user stories for this project yet.</p>
                    ) : (
                        <ul className="story-list">
                            {stories.map((story) => (
                                <li key={story._id} className="story-item">
                                    <div className="story-topline">
                                        <strong>{story.title}</strong>
                                        <span>Priority: {story.priority} | Status: {story.status}</span>
                                    </div>
                                    <p>{story.description}</p>
                                    <p>Assigned: {username(story.assigned_user_id)}</p>
                                    <div className="story-actions">
                                        <button type="button" disabled={saving}
                                            onClick={() => editStory(story)}>Edit</button>
                                        <button type="button" disabled={saving}
                                            onClick={() => deleteStory(story)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {formMode && (
                        <form className="story-form" onSubmit={saveStory}>
                            <h3>{formMode === "create" ? "Create User Story" : "Edit User Story"}</h3>
                            <label htmlFor="story-title">Title</label>
                            <input id="story-title" name="title" value={form.title}
                                onChange={updateField} required />

                            <label htmlFor="story-description">Description</label>
                            <textarea id="story-description" name="description" rows="3"
                                placeholder="As a [user], I want [goal], so that [benefit]."
                                value={form.description} onChange={updateField} required />

                            <label htmlFor="story-priority">Priority</label>
                            <select id="story-priority" name="priority" value={form.priority}
                                onChange={updateField}>
                                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>

                            {formMode === "edit" && (
                                <>
                                    <label htmlFor="story-status">Status</label>
                                    <select id="story-status" name="status" value={form.status}
                                        onChange={updateField}>
                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </>
                            )}
                            {formMode === "create" && <p>New stories start with status: To Do.</p>}

                            <label htmlFor="story-assignee">Assigned Member</label>
                            <select id="story-assignee" name="assigned_user_id"
                                value={form.assigned_user_id} onChange={updateField}>
                                <option value="">Unassigned</option>
                                {memberUsers.map((user) => (
                                    <option key={user._id} value={user._id}>{user.username}</option>
                                ))}
                            </select>

                            <div className="story-actions">
                                <button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Story"}
                                </button>
                                <button type="button" disabled={saving} onClick={closeForm}>Cancel</button>
                            </div>
                        </form>
                    )}
                </>
            )}
            {message && <p className="backlog-message" role="status">{message}</p>}
        </div>
    );
}

export default ProjectBacklog;
