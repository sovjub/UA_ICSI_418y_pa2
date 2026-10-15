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
