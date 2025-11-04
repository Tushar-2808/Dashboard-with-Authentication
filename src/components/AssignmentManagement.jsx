import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const AssignmentManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
    link: "",
    type: "individual"
  });

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
    if (!foundCourse || foundCourse.professorEmail !== user.email) {
      navigate("/");
      return;
    }
    setCourse(foundCourse);

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const courseAssignments = storedAssignments.filter(a => a.courseId === courseId);
    setAssignments(courseAssignments);
  }, [courseId, navigate]);

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    const id = "a" + Date.now() + Math.floor(Math.random() * 1000);
    const assignment = {
      id,
      courseId: courseId,
      title: newAssignment.title,
      description: newAssignment.description,
      deadline: newAssignment.deadline,
      link: newAssignment.link,
      type: newAssignment.type,
      acknowledgments: [],
      groupLeader: "",
      groupMembers: [],
      acknowledged: false,
      createdAt: new Date().toISOString()
    };

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const updatedAssignments = [...storedAssignments, assignment];
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: "", description: "", deadline: "", link: "", type: "individual" });
    setShowCreateForm(false);
    toast.success("Assignment created successfully!");
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline,
      link: assignment.link,
      type: assignment.type
    });
    setShowCreateForm(true);
  };

  const handleUpdateAssignment = () => {
    if (!editingAssignment) return;

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const updatedAssignments = storedAssignments.map(a => {
      if (a.id === editingAssignment.id) {
        return {
          ...a,
          title: newAssignment.title,
          description: newAssignment.description,
          deadline: newAssignment.deadline,
          link: newAssignment.link,
          type: newAssignment.type
        };
      }
      return a;
    });
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    setAssignments(updatedAssignments.filter(a => a.courseId === courseId));
    setEditingAssignment(null);
    setNewAssignment({ title: "", description: "", deadline: "", link: "", type: "individual" });
    setShowCreateForm(false);
    toast.success("Assignment updated successfully!");
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    const storedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    const updatedAssignments = storedAssignments.filter(a => a.id !== assignmentId);
    localStorage.setItem("assignments", JSON.stringify(updatedAssignments));
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    toast.success("Assignment deleted successfully!");
  };

  const getSubmissionCount = (assignment) => {
    if (assignment.type === "individual") {
      return assignment.acknowledgments?.length || 0;
    } else {
      return assignment.acknowledged ? (assignment.groupMembers?.length || 0) : 0;
    }
  };

  const getTotalStudents = () => {
    return course?.students?.length || 0;
  };

  const getSubmissionProgress = (assignment) => {
    const submitted = getSubmissionCount(assignment);
    const total = assignment.type === "individual" ? getTotalStudents() : 1;
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  };

  const getFilteredAssignments = () => {
    let filtered = assignments;

    // Filter by status
    if (filterStatus === "submitted") {
      filtered = filtered.filter(a => getSubmissionCount(a) > 0);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter(a => getSubmissionCount(a) === 0);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (!currentUser || !course) return <div className="dashboard-container">Loading...</div>;

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <h1>Assignment Management: {course.name}</h1>
      </div>

      {/* Analytics Summary */}
      <div className="analytics-summary">
        <div className="stat-card">
          <div className="stat-value">{assignments.length}</div>
          <div className="stat-label">Total Assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getTotalStudents()}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {assignments.filter(a => getSubmissionCount(a) > 0).length}
          </div>
          <div className="stat-label">Assignments with Submissions</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search assignments..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Assignments</option>
          <option value="submitted">With Submissions</option>
          <option value="pending">No Submissions</option>
        </select>
        <button
          className="create-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingAssignment(null);
            setNewAssignment({ title: "", description: "", deadline: "", link: "", type: "individual" });
          }}
        >
          {showCreateForm ? "Cancel" : "+ Create Assignment"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="create-assignment-form">
          <h3>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</h3>
          <input
            type="text"
            placeholder="Assignment Title *"
            name="title"
            value={newAssignment.title}
            onChange={handleAssignmentChange}
            required
          />
          <textarea
            placeholder="Description"
            name="description"
            value={newAssignment.description}
            onChange={handleAssignmentChange}
            rows="3"
          />
          <input
            type="datetime-local"
            name="deadline"
            value={newAssignment.deadline}
            onChange={handleAssignmentChange}
            required
          />
          <input
            type="url"
            placeholder="OneDrive Link"
            name="link"
            value={newAssignment.link}
            onChange={handleAssignmentChange}
          />
          <select name="type" value={newAssignment.type} onChange={handleAssignmentChange}>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
          <div className="form-actions">
            <button
              className="submit-btn"
              onClick={editingAssignment ? handleUpdateAssignment : handleAddAssignment}
            >
              {editingAssignment ? "Update Assignment" : "Create Assignment"}
            </button>
          </div>
        </div>
      )}

      {/* Assignments Grid */}
      <div className="assignments-grid">
        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments found</p>
          </div>
        ) : (
          filteredAssignments.map(assignment => {
            const progress = getSubmissionProgress(assignment);
            const submittedCount = getSubmissionCount(assignment);
            const totalCount = assignment.type === "individual" ? getTotalStudents() : 1;

            return (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  <div className="assignment-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditAssignment(assignment)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p className="assignment-description">{assignment.description}</p>
                <div className="assignment-details">
                  <div className="detail-item">
                    <span className="detail-label">Deadline:</span>
                    <span className="detail-value">
                      {new Date(assignment.deadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className={`detail-badge ${assignment.type}`}>
                      {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                    </span>
                  </div>
                  {assignment.link && (
                    <div className="detail-item">
                      <a
                        href={assignment.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="onedrive-link"
                      >
                        📎 Open OneDrive
                      </a>
                    </div>
                  )}
                </div>
                <div className="submission-stats">
                  <div className="stats-header">
                    <span>Submissions: {submittedCount} / {totalCount}</span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;

