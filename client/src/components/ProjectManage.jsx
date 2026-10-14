import { useEffect, useState } from "react";

const API = "http://localhost:9000";

function ProjectManage() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [message, setMessage] = useState("");

    const selectedProject = projects.find(
        (project) => project._id === selectedProjectId
    );

    function getUsername(userId) {
        const user = users.find((user) => user._id === userId);
        return user ? user.username : "Unknown user";
    }

    async function fetchProjects() {
        try {
            const response = await fetch(`${API}/api/projects`);

            if (!response.ok) {
                throw new Error("Failed to retrieve projects.");
            }

            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error(error);
            setMessage("Could not retrieve projects.");
        }
    }

    async function fetchUsers() {
        try {
            const response = await fetch(`${API}/api/users`);

            if (!response.ok) {
                throw new Error("Failed to retrieve users.");
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
            setMessage("Could not retrieve users.");
        }
    }

    async function fetchMembers(projectId) {
        if (!projectId) {
            setMembers([]);
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/projects/${projectId}/members`
            );

            if (!response.ok) {
                throw new Error("Failed to retrieve members.");
            }

            const data = await response.json();
            setMembers(data);
        } catch (error) {
            console.error(error);
            setMessage("Could not retrieve project members.");
        }
    }

    useEffect(() => {
        fetchProjects();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchMembers(selectedProjectId);
        setSelectedUserId("");
    }, [selectedProjectId]);

    async function handleAddMember(event) {
        event.preventDefault();

        if (!selectedProjectId || !selectedUserId) {
            setMessage("Select a project and user first.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/projects/${selectedProjectId}/members`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: selectedUserId
                    })
                }
            );

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                setSelectedUserId("");
                await fetchMembers(selectedProjectId);
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not add member.");
        }
    }

    async function handleRemoveMember(userId) {
        try {
            const response = await fetch(
                `${API}/api/projects/${selectedProjectId}/members/${userId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                await fetchMembers(selectedProjectId);
            }
        } catch (error) {
            console.error(error);
            setMessage("Could not remove member.");
        }
    }

    return (
        <div>
            <h2>Manage Projects</h2>

            <label htmlFor="projectSelect">Select Project:</label>

            <select
                id="projectSelect"
                value={selectedProjectId}
                onChange={(event) => {
                    setSelectedProjectId(event.target.value);
                    setMessage("");
                }}
                onFocus={fetchProjects}
            >
                <option value="">Select a project</option>

                {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>

            {selectedProject && (
                <div>
                    <h3>Project Details</h3>

                    <p><strong>Name:</strong> {selectedProject.name}</p>
                    <p><strong>Description:</strong> {selectedProject.description}</p>
                    <p><strong>Status:</strong> {selectedProject.status}</p>
                    <p>
                        <strong>Project Lead:</strong>{" "}
                        {getUsername(selectedProject.project_lead_id)}
                    </p>

                    <h3>Project Members</h3>

                    {members.length === 0 ? (
                        <p>No members found.</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {members.map((membership) => {
                                const isLead =
                                    membership.user_id ===
                                    selectedProject.project_lead_id;

                                return (
                                    <li
                                        key={membership._id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "10px"
                                        }}
                                    >
                                        <span>
                                            {getUsername(membership.user_id)}
                                        </span>

                                        {isLead ? (
                                            <strong>(Lead)</strong>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMember(
                                                        membership.user_id
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <h3>Add Member</h3>

                    <form onSubmit={handleAddMember}>
                        <select
                            value={selectedUserId}
                            onChange={(event) =>
                                setSelectedUserId(event.target.value)
                            }
                            onFocus={fetchUsers}
                            required
                        >
                            <option value="">Select a user</option>

                            {users.map((user) => {
                                const alreadyMember = members.some(
                                    (membership) =>
                                        membership.user_id === user._id
                                );

                                return (
                                    <option
                                        key={user._id}
                                        value={user._id}
                                        disabled={alreadyMember}
                                    >
                                        {user.username}
                                        {alreadyMember
                                            ? " (Already a member)"
                                            : ""}
                                    </option>
                                );
                            })}
                        </select>

                        <button type="submit">Add Member</button>
                    </form>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
}

export default ProjectManage;