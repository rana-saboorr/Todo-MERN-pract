# Todo Frontend

This is the frontend application for the Todo app, built with React and Vite. It provides a user interface for user authentication, todo management, and notes functionality.

## Features

- User registration and login
- Protected routes for authenticated users
- Todo creation, editing, and deletion
- Notes management
- Responsive design with Tailwind CSS
- State management with Redux Toolkit
- API integration with Axios

## Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Icons** - Icon library

## Installation

1. Clone the repository
2. Navigate to the frontend directory: `cd Todo/Frontend/todo`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:3000
   ```
5. Start the development server: `npm run dev`

The app will run on http://localhost:5173

## Project Structure

```
Frontend/todo/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── App.css              # App-specific styles
│   ├── components/
│   │   ├── ProtectedRoute.jsx  # Route protection component
│   │   └── axios.js         # Axios configuration
│   ├── pages/
│   │   ├── login.jsx        # Login page
│   │   ├── signup.jsx       # Signup page
│   │   ├── todo.jsx         # Todo page
│   │   └── notes.jsx        # Notes page
│   ├── store/
│   │   ├── store.js         # Redux store
│   │   ├── authSlice.js     # Auth state slice
│   │   └── todoSlice.js     # Todo state slice
│   └── assets/              # Static assets
├── public/                  # Public assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. Register a new account or login with existing credentials
2. Access the todo page to manage your tasks
3. Use the notes page for additional note-taking
4. All routes are protected and require authentication
