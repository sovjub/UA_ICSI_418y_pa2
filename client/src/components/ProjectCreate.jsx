import { useEffect, useState } from "react";

function ProjectCreate() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Planning");
    const [projectLeadId, setProjectLeadId] = useState("");

    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    // Load registered users for the project lead dropdown.
    useEffect(() => {
        async function loadUsers() {
            try {
                const response = await fetch("http://localhost:9000/api/users");
                if (!response.ok) throw new Error("Could not load users.");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setMessage("Could not load registered users.");
            }
        }
        loadUsers();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:9000/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    status: status,
                    project_lead_id: projectLeadId
                })
            });

            const data = await response.json();
            setMessage(data.message || (response.ok ? "Project created." : "Could not create project."));

            if (response.ok) {
                setName("");
                setDescription("");
                setStatus("Planning");
                setProjectLeadId("");
            }
        } catch (error) {
            setMessage("Could not contact the server.");
        }
    }

    return (
        <div>
            <h2>Create Project</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                />

                <label htmlFor="project-status">Status</label>
                <select
                    id="project-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    required
                >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>

                <label htmlFor="project-lead">Project Lead</label>
                <select
                    id="project-lead"
                    value={projectLeadId}
                    onChange={(event) => setProjectLeadId(event.target.value)}
                    required
                >
                    <option value="">Select a registered user</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.username}
                        </option>
                    ))}
                </select>

                <button type="submit">Create Project</button>
            </form>

            <p role="status">{message}</p>
        </div>
    );
}

export default ProjectCreate;
