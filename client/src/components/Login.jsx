import { useState } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState(""); // that log box we made

    async function handleSubmit(event) { // submitting a form triggers me!
        event.preventDefault();

        try {// given this data, request the server at address *** and AWAIT for server response
            const response = await fetch("http://localhost:9000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json(); // json to JS

            setMessage(data.message); // server response
        }
        catch (error) { // this block happens if something goes wrong contacting teh server
            setMessage("Could not contact the server.");
        }
    }

    return ( // structure of the account panel when in the login state
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />

                <button type="submit">Login</button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Login;