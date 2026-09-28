import { useState } from "react";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import "./App.css";

function App() {
  const [mode, setMode] = useState("login"); // start in the login state, our radio buttons will change this

  return (
    <div>
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
  );
}

export default App;