# GoMusic

A modern music application with a Go backend and JavaScript frontend.

## Overview

GoMusic is a web application that allows users to [brief description of what your application does - e.g., browse, stream, and manage music collections]. The application is built with a Go backend for robust server-side operations and a JavaScript frontend for a responsive user interface.

## System Requirements

- Go 1.18 or higher
- Node.js 16.x or higher
- npm 8.x or higher

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/gomusic.git
cd gomusic
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install NPM dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend Server

1. From the project root, navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the backend server:
   ```bash
   go run cmd/api/main.go
   ```

3. The backend server will start and listen for requests, typically on `http://localhost:8080` (check console output for the exact address).

### Start the Frontend Development Server

1. From the project root, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. The frontend development server will start, typically on `http://localhost:3000` (check console output for the exact address).

4. Open your browser and navigate to the frontend address to use GoMusic.



### Common Issues

- **Backend fails to start**: Check if the required port is already in use or if you have the correct permissions.
- **Frontend dependency issues**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
- **API connection errors**: Ensure the backend is running and check CORS settings if applicable.
