import { useState } from "react";

function ProjectManage() {

    // Data retrieved from MongoDB through Express
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [members, setMembers] = useState([]);

    // Currently selected project and user
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    // Feedback displayed to the user
    const [message, setMessage] = useState("");

    return (
        <div>
            <h2>Manage Projects</h2>

            <label htmlFor="projectSelect">Select Project:</label>

            <select
                id="projectSelect"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
            >
                <option value="">Select a project</option>

                {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ProjectManage;