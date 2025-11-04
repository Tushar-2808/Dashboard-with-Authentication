import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    professor: "",
    professorEmail: ""
  });

  // Load current user, courses, assignments
  useEffect(() => {
    const token = localStorage.getItem("currentUser");
    if (!token) return;
    const user = JSON.parse(atob(token));
    setCurrentUser(user);

    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const profCourses = storedCourses.filter(course => course.professorEmail === user.email);
    setCourses(profCourses);

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(storedAssignments);
  }, []);

  // New course input change
  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  // Add new course
  const handleAddCourse = () => {
    if (!newCourse.name) {
      toast.error("Please enter a course name");
      return;
    }
    const id = "c" + Date.now() + Math.floor(Math.random() * 1000);
    const course = {
      id,
      name: newCourse.name,
      professor: currentUser.name,
      professorEmail: currentUser.email,
      students: []
    };
    const updatedCourses = [...courses, course];
    setCourses(updatedCourses);

    // Update global storage
    const allCourses = JSON.parse(localStorage.getItem("courses")) || [];
    allCourses.push(course);
    localStorage.setItem("courses", JSON.stringify(allCourses));

    toast.success("Course added successfully!");
    setNewCourse({ name: "", professor: "", professorEmail: "" });
  };

  const getCourseStats = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id);
    const totalStudents = course.students?.length || 0;
    return {
      assignmentsCount: courseAssignments.length,
      studentsCount: totalStudents,
      assignmentsWithSubmissions: courseAssignments.filter(a => {
        if (a.type === "individual") {
          return (a.acknowledgments?.length || 0) > 0;
        } else {
          return a.acknowledged;
        }
      }).length
    };
  };

  if (!currentUser) return <div className="dashboard-container">Please login first</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser.name}</h1>
        <p className="dashboard-subtitle">Manage your courses and assignments</p>
      </div>

      {/* Add Course */}
      <div className="add-course-section">
        <h2>Create New Course</h2>
        <div className="add-course-form">
          <input
            type="text"
            placeholder="Enter course name"
            name="name"
            value={newCourse.name}
            onChange={handleCourseChange}
            onKeyPress={(e) => e.key === "Enter" && handleAddCourse()}
          />
          <button onClick={handleAddCourse} className="add-course-btn">
            + Add Course
          </button>
        </div>
      </div>

      <h2 className="section-title">Your Courses</h2>
      {courses.length === 0 ? (
        <div className="empty-state">
          <p>You are not teaching any courses yet. Create your first course above!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => {
            const stats = getCourseStats(course);
            return (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/course/${course.id}/assignments`)}
              >
                <div className="course-card-header">
                  <h3>{course.name}</h3>
                  <span className="course-badge">View Assignments →</span>
                </div>
                <p className="course-professor">Professor: {course.professor}</p>
                <div className="course-stats">
                  <div className="stat-item">
                    <span className="stat-number">{stats.assignmentsCount}</span>
                    <span className="stat-label">Assignments</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.studentsCount}</span>
                    <span className="stat-label">Students</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{stats.assignmentsWithSubmissions}</span>
                    <span className="stat-label">With Submissions</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
