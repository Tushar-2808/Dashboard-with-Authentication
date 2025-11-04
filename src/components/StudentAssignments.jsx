import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const StudentAssignments = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("currentUser");
    if (!token) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(atob(token));
    setCurrentUser(user);

    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    const foundCourse = storedCourses.find(c => c.id === courseId);
    if (!foundCourse || !foundCourse.students.includes(user.email)) {
      navigate("/");
      return;
    }
    setCourse(foundCourse);

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const courseAssignments = storedAssignments.filter(a => a.courseId === courseId);
    setAssignments(courseAssignments);

    // Load user groups
    const storedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    const userGroupsList = storedGroups.filter(g =>
      g.courseId === courseId && g.members.includes(user.email)
    );
    setUserGroups(userGroupsList);
  }, [courseId, navigate]);

  const isGroupLeader = (assignment) => {
    if (assignment.type !== "group") return false;
    // For now, we'll allow any student to acknowledge if they're in a group
    // In a real app, you'd have proper group leader assignment
    const group = userGroups.find(g => g.assignmentId === assignment.id);
    if (group) {
      // If group leader is set, check if current user is leader
      if (group.leader) {
        return group.leader === currentUser.email;
      }
      // If no leader set, allow first member to acknowledge
      return group.members[0] === currentUser.email;
    }
    return false;
  };

  const isInGroup = (assignment) => {
    if (assignment.type !== "group") return true; // Individual assignments don't need groups
    return userGroups.some(g => g.assignmentId === assignment.id && g.members?.includes(currentUser.email));
  };

  const handleAcknowledge = (assignment) => {
    if (assignment.type === "group" && !isGroupLeader(assignment)) {
      toast.error("Only the group leader can acknowledge group assignments");
      return;
    }

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const updatedAssignments = storedAssignments.map(a => {
      if (a.id === assignment.id) {
        if (a.type === "individual") {
          if (!a.acknowledgments) a.acknowledgments = [];
          if (!a.acknowledgments.includes(currentUser.email)) {
            a.acknowledgments.push({
              email: currentUser.email,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // Group submission
          if (!a.acknowledged) {
            a.acknowledged = true;
            a.acknowledgedBy = currentUser.email;
            a.acknowledgedAt = new Date().toISOString();
            if (!a.groupMembers) a.groupMembers = [];
            // Add all group members
            const group = userGroups.find(g => g.assignmentId === assignment.id);
            if (group) {
              group.members.forEach(member => {
                if (!a.groupMembers.includes(member)) {
                  a.groupMembers.push(member);
                }
              });
            }
          }
        }
      }
      return a;
    });
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    setAssignments(updatedAssignments.filter(a => a.courseId === courseId));
    toast.success("Assignment acknowledged successfully!");
  };

  const getAcknowledgmentStatus = (assignment) => {
    if (assignment.type === "individual") {
      // Support both old format (array of emails) and new format (array of objects)
      const acknowledgment = assignment.acknowledgments?.find(a => {
        if (typeof a === "object") {
          return a.email === currentUser.email;
        }
        return a === currentUser.email;
      });
      
      if (acknowledgment) {
        return {
          acknowledged: true,
          timestamp: typeof acknowledgment === "object" ? acknowledgment.timestamp : null
        };
      }
      return { acknowledged: false };
    } else {
      // Group assignment
      if (!assignment.acknowledged) {
        return { acknowledged: false };
      }
      // Check if current user is in the group that acknowledged
      const group = userGroups.find(g => g.assignmentId === assignment.id);
      if (group && assignment.groupMembers?.includes(currentUser.email)) {
        return {
          acknowledged: true,
          timestamp: assignment.acknowledgedAt,
          acknowledgedBy: assignment.acknowledgedBy
        };
      }
      return { acknowledged: false };
    }
  };

  const formatDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = deadlineDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) {
      return { text: "Overdue", urgent: true, date: deadlineDate.toLocaleString() };
    } else if (days === 0 && hours < 24) {
      return { text: `Due in ${hours} hours`, urgent: true, date: deadlineDate.toLocaleString() };
    } else if (days === 1) {
      return { text: "Due tomorrow", urgent: true, date: deadlineDate.toLocaleString() };
    } else if (days <= 7) {
      return { text: `Due in ${days} days`, urgent: false, date: deadlineDate.toLocaleString() };
    } else {
      return { text: deadlineDate.toLocaleString(), urgent: false, date: deadlineDate.toLocaleString() };
    }
  };

  if (!currentUser || !course) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <h1>Assignments: {course.name}</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>No assignments available for this course yet.</p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => {
            const status = getAcknowledgmentStatus(assignment);
            const deadlineInfo = formatDeadline(assignment.deadline);
            const canAcknowledge = assignment.type === "individual" || isGroupLeader(assignment);
            const needsGroup = assignment.type === "group" && !isInGroup(assignment);

            return (
              <div
                key={assignment.id}
                className={`assignment-card ${status.acknowledged ? "acknowledged" : ""}`}
              >
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  {status.acknowledged && (
                    <span className="status-badge success">
                      ✓ Acknowledged
                    </span>
                  )}
                </div>

                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-info-grid">
                  <div className="info-item">
                    <span className="info-label">📅 Deadline:</span>
                    <span className={`info-value ${deadlineInfo.urgent ? "urgent" : ""}`}>
                      {deadlineInfo.date}
                    </span>
                    {deadlineInfo.urgent && (
                      <span className="deadline-warning">{deadlineInfo.text}</span>
                    )}
                  </div>

                  <div className="info-item">
                    <span className="info-label">📝 Type:</span>
                    <span className={`type-badge ${assignment.type}`}>
                      {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                    </span>
                  </div>

                  {assignment.link && (
                    <div className="info-item">
                      <a
                        href={assignment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="onedrive-link"
                      >
                        📎 Open OneDrive Submission Link
                      </a>
                    </div>
                  )}

                  {status.acknowledged && status.timestamp && (
                    <div className="info-item">
                      <span className="info-label">✓ Submitted:</span>
                      <span className="info-value">
                        {new Date(status.timestamp).toLocaleString()}
                      </span>
                      {assignment.type === "group" && status.acknowledgedBy && (
                        <span className="info-hint">
                          (By {status.acknowledgedBy === currentUser.email ? "You" : "Group Leader"})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {needsGroup && (
                  <div className="group-warning">
                    <p>⚠️ You are not part of any group for this assignment.</p>
                    <p>Please form or join a group to submit this assignment.</p>
                  </div>
                )}

                {!status.acknowledged && !needsGroup && (
                  <button
                    className="acknowledge-btn"
                    onClick={() => handleAcknowledge(assignment)}
                    disabled={!canAcknowledge}
                  >
                    {assignment.type === "individual"
                      ? "✓ Yes, I have submitted"
                      : "✓ Submit as Group Leader"}
                  </button>
                )}

                {!status.acknowledged && assignment.type === "group" && !isGroupLeader(assignment) && isInGroup(assignment) && (
                  <div className="waiting-message">
                    Waiting for group leader to submit...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;

