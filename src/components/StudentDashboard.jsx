import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("currentUser");
    if (!token) return;
    const user = JSON.parse(atob(token));
    setCurrentUser(user);

    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    setAssignments(storedAssignments);
  }, []);

  if (!currentUser) return <div className="dashboard-container">Please login first</div>;

  // Filter enrolled and available courses
  const enrolledCourses = courses.filter(course => course.students?.includes(currentUser.email));
  const availableCourses = courses.filter(course => !course.students?.includes(currentUser.email));

  // Enroll in a course
  const handleEnroll = (courseId) => {
    const allCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const updatedCourses = allCourses.map(course => {
      if (course.id === courseId && !course.students?.includes(currentUser.email)) {
        return { ...course, students: [...(course.students || []), currentUser.email] };
      }
      return course;
    });
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
    toast.success("Enrolled successfully!");
  };

  // Get course progress
  const getCourseProgress = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id);
    if (courseAssignments.length === 0) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    courseAssignments.forEach(a => {
      if (a.type === "individual") {
        const acknowledged = a.acknowledgments?.some(ack => 
          typeof ack === "object" ? ack.email === currentUser.email : ack === currentUser.email
        );
        if (acknowledged) completed++;
      } else {
        if (a.acknowledged && a.groupMembers?.includes(currentUser.email)) {
          completed++;
        }
      }
    });

    return {
      completed,
      total: courseAssignments.length,
      percentage: courseAssignments.length > 0 ? Math.round((completed / courseAssignments.length) * 100) : 0
    };
  };

  const getPendingAssignments = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id);
    return courseAssignments.filter(a => {
      if (a.type === "individual") {
        const acknowledged = a.acknowledgments?.some(ack => 
          typeof ack === "object" ? ack.email === currentUser.email : ack === currentUser.email
        );
        return !acknowledged;
      } else {
        return !(a.acknowledged && a.groupMembers?.includes(currentUser.email));
      }
    }).length;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser.name}</h1>
        <p className="dashboard-subtitle">View your courses and assignments</p>
      </div>

      {/* Your Courses */}
      <h2 className="section-title">Your Courses</h2>
      {enrolledCourses.length === 0 ? (
        <div className="empty-state">
          <p>You are not enrolled in any courses yet. Browse available courses below to enroll!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {enrolledCourses.map(course => {
            const progress = getCourseProgress(course);
            const pending = getPendingAssignments(course);
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
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress: {progress.completed}/{progress.total} completed</span>
                    <span className="progress-percentage">{progress.percentage}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  {pending > 0 && (
                    <p className="pending-badge">
                      {pending} {pending === 1 ? "assignment" : "assignments"} pending
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Courses */}
      <h2 className="section-title">Available Courses</h2>
      {availableCourses.length === 0 ? (
        <div className="empty-state">
          <p>No new courses available to enroll.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {availableCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-card-header">
                <h3>{course.name}</h3>
              </div>
              <p className="course-professor">Professor: {course.professor}</p>
              <button
                className="enroll-btn"
                onClick={() => handleEnroll(course.id)}
              >
                Enroll in Course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
