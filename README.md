# 🎓 JoinEazy – Role-Based Assignment Management Frontend

**JoinEazy** is a modern, responsive, and intuitive frontend built with **React.js** and **Tailwind CSS**.  
It brings to life the role-based workflows for both **Professors** and **Students**, making assignment creation, submission, and acknowledgment seamless.

🔗 **Live Demo:** [https://dashboard-authentication.netlify.app/](https://dashboard-authentication.netlify.app/)

---

## 🚀 Features

### 👨‍🏫 Professor Flow
- **Authentication:** Secure Login/Register with role-based redirect.
- **Dashboard:** View and manage all courses they teach.
- **Assignment Management:**
  - Create, edit, and view assignments.
  - Add assignment details:
    - Title
    - Description
    - Deadline
    - OneDrive Link
    - Submission Type (Group / Individual)
  - View analytics:
    - Number of students/groups submitted
    - Submission progress bars
- **Add Courses:** Professors can add new courses that students can later join.

---

### 🎓 Student Flow
- **Authentication:** JWT-based login and register system with smooth transitions and form validation.
- **Dashboard:**
  - View all enrolled courses.
  - View assignments per course with:
    - Name
    - Description
    - Deadline
    - Submission link
    - Submission type
    - Acknowledgment status
- **Submission Logic:**
  - **Individual:** Students acknowledge their submission with a timestamp.
  - **Group:** Only the group leader acknowledges; others automatically see "Acknowledged".
- **Course Enrollment:** Students can browse available courses and join.
- **Progress Visualization:**
  - Progress bars
  - Checkmarks and badges
  - Animated feedback with toasts and hover effects

---

## 🧩 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **React.js (Vite)** | Core frontend framework |
| **Tailwind CSS** | Styling and responsive design |
| **React Router** | Page navigation and protected routes |
| **Local Storage (JWT Simulation)** | Local authentication & persistence |
| **Vite** | Lightning-fast development server |

---

## 📂 Folder Structure
src/
├── components/
│ ├── Navbar.jsx
│ ├── Login.jsx
│ ├── Register.jsx
│ ├── StudentDashboard.jsx
│ ├── ProfessorDashboard.jsx
│ └── AssignmentPage.jsx
├── styles.css
├── App.jsx
├── index.css
└── main.jsx

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
git clone https://github.com/Tushar-2808/Dashboard-with-Authentication.git

2️⃣ Install Dependencies
npm install

3️⃣ Start the Development Server
npm run dev

Then open http://localhost:5173 in your browser

🌐 Deployment

This project is live at:
👉 https://dashboard-authentication.netlify.app/

Hosted using Netlify with automatic build from GitHub main branch.

🧠 Future Improvements

Integrate real backend (Node.js + Express + MongoDB)

Role-based JWT verification via API

Group creation & management for students

File upload integration (OneDrive / Google Drive APIs)

Analytics dashboard for professors

👨‍💻 Author
Tushar 

Frontend & Game Developer
📧 tkumar2808@gmail.com

⭐ If you found this project helpful, consider giving it a star on GitHub!


---

✅ Once you paste and save this as `README.md`, run these in your terminal to commit and push it to GitHub:

git add README.md
git commit -m "Added detailed README file"
git push
