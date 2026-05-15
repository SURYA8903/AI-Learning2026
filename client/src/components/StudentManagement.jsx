import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';

const StudentManagement = ({ user }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  // Fetch students/enrollments
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/trainer/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments(response.data.data);
      setFilteredEnrollments(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter enrollments
  useEffect(() => {
    let filtered = enrollments;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((e) => e.completion_status === statusFilter);
    }

    setFilteredEnrollments(filtered);
  }, [searchTerm, statusFilter, enrollments]);

  // Update student completion status
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setProcessing(true);
      await axios.put(
        `${API_BASE}/trainer/approve-completion`,
        {
          enrollmentId: selectedEnrollment.enrollmentId,
          completion_status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Status updated to ${newStatus} successfully!`);
      if (newStatus === 'Completed') {
        alert('Certificate generated and student notified via email.');
      }

      fetchEnrollments();
      setShowModal(false);
      setNewStatus('');
      setSelectedEnrollment(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': '#2196F3',
      'Completed': '#4CAF50',
      'Not Completed': '#F44336',
      'In Review': '#FFC107',
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return <div className="loading">Loading enrollment data...</div>;
  }

  return (
    <div className="student-management">
      <div className="header">
        <h1>👨‍🏫 Trainer Dashboard: Student Progress</h1>
        <button className="refresh-btn" onClick={fetchEnrollments}>
          🔄 Refresh Data
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by student, email, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Completed">Completed</option>
          <option value="Not Completed">Not Completed</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Progress</th>
              <th>Completion Status</th>
              <th>Enrolled On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((e) => (
                <tr key={e.enrollmentId}>
                  <td>
                    <strong>{e.studentName}</strong>
                    <br />
                    <small>{e.studentEmail}</small>
                  </td>
                  <td>{e.courseTitle}</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${e.progress || 0}%`,
                          backgroundColor: e.progress >= 100 ? '#4CAF50' : '#2196F3'
                        }}
                      />
                      <span>{e.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(e.completion_status),
                      }}
                    >
                      {e.completion_status}
                    </span>
                  </td>
                  <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedEnrollment(e);
                        setNewStatus(e.completion_status);
                        setShowModal(true);
                      }}
                    >
                      ⚖️ Review & Mark
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No student enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedEnrollment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Student Completion</h2>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Student:</strong> {selectedEnrollment.studentName}
              </p>
              <p>
                <strong>Course:</strong> {selectedEnrollment.courseTitle}
              </p>
              <p>
                <strong>Current Progress:</strong> {selectedEnrollment.progress}%
              </p>

              <div className="status-selection">
                <label>Set Completion Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Not Completed">Not Completed</option>
                </select>
              </div>

              {newStatus === 'Completed' && (
                <div className="info-box success">
                  <p>
                    🌟 <strong>Note:</strong> Marking as "Completed" will automatically 
                    generate the certificate and send it to the student.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <h3>In Review</h3>
          <p>{enrollments.filter(e => e.completion_status === 'In Review').length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{enrollments.filter(e => e.completion_status === 'Completed').length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Managed</h3>
          <p>{enrollments.length}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
