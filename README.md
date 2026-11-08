# ICSI 418Y - PA3

This project expands on PA2's login and signup application by adding
project creation and project membership management.

The frontend uses React, the backend uses Express, and MongoDB Atlas
is used to store users, projects, and memberships.

## Running the Project

The project requires Node.js and a MongoDB Atlas connection.

1. Run `npm install` in both the client and server folders.
2. Add a `.env` file to the server folder with:
   `MONGODB_URI=your_connection_string`
3. Start the server with `node server.js`.
4. Start the client with `npm run dev`.
5. Open the address shown by Vite.

The server runs on port 9000.


## PA4 - User Stories and Backlog

PA4 expands on PA3 by adding user stories to projects.

Users can now create, edit, and delete stories through the Project Backlog
menu. Each story has a title, description, priority, status, and an optional
assigned project member.

Stories are stored in MongoDB and linked to their respective projects.
New stories start with the "To Do" status, but can later be changed to
"In Progress" or "Done".

Members cannot be removed from a project while they still have stories
assigned to them. Those stories must first be reassigned, unassigned,
or deleted.

## Test Data

Test data can be created manually through the application.

1. Register at least 3 users.
2. Create 2 projects and add at least one non-lead member.
3. Create at least 5 stories across the two projects.
4. Use all three priorities (High, Medium, Low).
5. Edit stories to include all three statuses.
6. Include both assigned and unassigned stories.

The application can then be tested by switching between projects,
editing stories, deleting stories, and attempting to remove members
who still have assigned work.

The existing setup instructions from PA3 still apply.


## ========================================================================Auto filled content below

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
