import { useState } from "react";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import ProjectCreate from "./components/ProjectCreate.jsx";
import ProjectManage from "./components/ProjectManage.jsx";
import ProjectBacklog from "./components/ProjectBacklog.jsx";

import "./App.css";

function App() {
  const [mode, setMode] = useState("login"); // start in the login state, our radio buttons will change this
  const [projectMode, setProjectMode] = useState("create");

  return (// constant elements regardless of webpage state, this is our Project|Account Panels
    <div className="app-layout">

      <div className="project-panel">
        <h1>Project Management</h1>

        <div>
          <label>
            <input
              type="radio"
              name="projectMode"
              checked={projectMode === "create"}
              onChange={() => setProjectMode("create")}
            />
            Create Project
          </label>

          <label>
            <input
              type="radio"
              name="projectMode"
              checked={projectMode === "manage"}
              onChange={() => setProjectMode("manage")}
            />
            Manage Projects
          </label>
          <label>
            <input
              type="radio"
              name="projectMode"
              checked={projectMode === "backlog"}
              onChange={() => setProjectMode("backlog")}
            />
            Project Backlog
          </label>
        </div>
        {projectMode === "create" ? <ProjectCreate /> :
          projectMode === "manage" ? <ProjectManage /> : <ProjectBacklog />}
      </div>

      <div className="account-panel">
        <h1>Account</h1>

        <div>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === "login"}
              onChange={() => setMode("login")}
            />
            Login
          </label>

          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === "signup"}
              onChange={() => setMode("signup")}
            />
            Signup
          </label>
        </div>

        {mode === "login" ? <Login /> : <Signup />}
      </div>

    </div>
  );
}

export default App;