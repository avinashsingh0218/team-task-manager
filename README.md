#  Team Task Manager

A full-stack task management application to manage projects, assign tasks, and track progress with **role-based access control (Admin/Member)**.

This project simulates a real-world workflow system (similar to Jira) with a focus on backend logic, authentication, and task management.

---

##  Features

###  Authentication

* Secure signup/login using JWT
* Password hashing with bcrypt

### Role-Based Access Control

* **Admin**

  * Create projects
  * Add/remove members
  * Create & assign tasks
* **Member**

  * View assigned tasks
  * Update task status

###  Project Management

* Create and manage multiple projects
* Add members to specific projects

###  Task Management

* Create tasks with:

  * Title, description
  * Assigned user
  * Due date
* Track status:

  * Todo → In Progress → Done

###  Dashboard

* Real-time statistics:

  * Total tasks
  * Completed tasks
  * In-progress tasks
  * Overdue tasks
* Overdue tasks highlighted dynamically

---

##  Tech Stack

### Frontend

* React (Vite)
* React Router
* Axios
* Tailwind / Custom CSS

### Backend

* FastAPI
* SQLAlchemy ORM
* SQLite (Development) / PostgreSQL (Production)

### Security

* JWT Authentication (`python-jose`)
* Password hashing (`bcrypt`)

---

##  Project Structure

```
team-task-manager/
├── frontend/
├── backend/
├── README.md
```

---

##  Local Setup

### 1. Backend

```
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

### 2. Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on:
👉 http://localhost:5174

---

##  Important Logic

* The **first registered user becomes Admin**
* All subsequent users are assigned **Member role**
* Tasks can only be assigned to users within the same project
* Role-based restrictions are enforced in both backend and frontend

---

##  Screenshots

(Add your images here)

![Dashboard](./assets/dashboard.png)
![Login](./assets/login.png)

---

##  Live Demo

(Add after deployment)

---

## 🎥 Demo Video

(Add 2–5 min demo video link)

---

## 🚀 Future Improvements

* Notifications for task updates
* Email alerts for overdue tasks
* AI-based task suggestions

---

## 👨‍💻 Author

Avinash Singh
