import { useState } from "react";

function Signup() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState(""); // the output log we made

    async function handleSubmit(event) { // form submission triggers me
        event.preventDefault();

        try { // send this data to the *** and AWAIT the response.
            const response = await fetch("http://localhost:9000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    f_name: firstName,
                    l_name: lastName,
                    username: username,
                    password: password
                })
            });
            const data = await response.json(); // convert data
            setMessage(data.message); // what did the server say back?
        }
        catch (error) {
            setMessage("Could not contact the server.");
        }
    }

    return (
        <div>
            <h2>Signup</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />

                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />

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

                <button type="submit">Signup</button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Signup;