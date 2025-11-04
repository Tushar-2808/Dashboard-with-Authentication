import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import ProfessorDashboard from "./components/ProfessorDashboard";
import StudentDashboard from "./components/StudentDashboard";
import AssignmentManagement from "./components/AssignmentManagement";
import StudentAssignments from "./components/StudentAssignments";

function App() {
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser")
      ? JSON.parse(atob(localStorage.getItem("currentUser")))
      : null
  );

  return (
    <>
      <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              currentUser.role === "professor" ? (
                <ProfessorDashboard />
              ) : (
                <StudentDashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={<Login setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/register"
          element={<Register setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/course/:courseId/assignments"
          element={
            currentUser ? (
              currentUser.role === "professor" ? (
                <AssignmentManagement />
              ) : (
                <StudentAssignments />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
