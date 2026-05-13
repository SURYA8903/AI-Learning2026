import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [certificateLoading, setCertificateLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data.data);
      setFilteredStudents(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (courseFilter) {
      filtered = filtered.filter((s) =>
        s.enrolledCourses.some((e) => e.courseId === courseFilter)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((s) =>
        s.enrolledCourses.some((e) => e.status === statusFilter)
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, courseFilter, statusFilter, students]);

  // Update student status
  const handleUpdateStatus = async (studentId, courseId) => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setCertificateLoading(true);
      const response = await axios.put(
        `${API_BASE}/certificate/update-status/${studentId}/${courseId}`,
        {
          status: newStatus,
          completionDate: new Date(),
          progress: newStatus === 'completed' ? 100 : 50,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Status updated successfully!');
      if (response.data.data.certificate) {
        alert(
          `Certificate generated and sent to ${selectedStudent.email}`
        );
      }

      fetchStudents();
      setShowModal(false);
      setNewStatus('');
      setSelectedStudent(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setCertificateLoading(false);
    }
  };

  // Generate certificate manually
  const handleGenerateCertificate = async (studentId, courseId) => {
    try {
      setCertificateLoading(true);
      const response = await axios.post(
        `${API_BASE}/certificate/generate/${studentId}/${courseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Certificate generated and sent successfully!');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate certificate');
      console.error('Error generating certificate:', err);
    } finally {
      setCertificateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFC107',
      in_progress: '#2196F3',
      completed: '#4CAF50',
      certificate_issued: '#8BC34A',
    };
    return colors[status] || '#999';
  };

  const getEnrollmentInfo = (student) => {
    return student.enrolledCourses.map((enrollment) => ({
      ...enrollment,
      courseTitle: enrollment.courseId.title || 'Unknown Course',
    }));
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="student-management">
      <div className="header">
        <h1>📚 Student Management</h1>
        <button className="refresh-btn" onClick={fetchStudents}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
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
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="certificate_issued">Certificate Issued</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>
                    <strong>{student.firstName} {student.lastName}</strong>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    {student.enrolledCourses.length > 0 ? (
                      <ul className="course-list">
                        {student.enrolledCourses.map((enrollment) => (
                          <li key={enrollment._id}>
                            {enrollment.courseId.title || 'Unknown'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No enrollments'
                    )}
                  </td>
                  <td>
                    {student.enrolledCourses.length > 0 ? (
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(
                            student.enrolledCourses[0].status
                          ),
                        }}
                      >
                        {student.enrolledCourses[0].status.replace('_', ' ')}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${student.enrolledCourses[0]?.progress || 0}%`,
                        }}
                      />
                      <span>{student.enrolledCourses[0]?.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Update Status
                    </button>
                    {student.enrolledCourses[0]?.status === 'completed' &&
                      !student.certificates.some(
                        (c) => c.status === 'issued'
                      ) && (
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            handleGenerateCertificate(
                              student._id,
                              student.enrolledCourses[0].courseId
                            )
                          }
                          disabled={certificateLoading}
                        >
                          🎓 Generate Cert
                        </button>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Status</h2>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Student:</strong> {selectedStudent.firstName}{' '}
                {selectedStudent.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudent.email}
              </p>

              <label>Select New Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="status-select"
              >
                <option value="">-- Choose Status --</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="certificate_issued">Certificate Issued</option>
              </select>

              <div className="info-box">
                <p>
                  ℹ️ When status is set to "Completed", a certificate will be
                  automatically generated and sent to the student's email.
                </p>
              </div>
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
                onClick={() =>
                  handleUpdateStatus(
                    selectedStudent._id,
                    selectedStudent.enrolledCourses[0].courseId
                  )
                }
                disabled={certificateLoading || !newStatus}
              >
                {certificateLoading ? 'Processing...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{students.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Enrollments</h3>
          <p>
            {students.reduce((sum, s) => sum + s.enrolledCourses.length, 0)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Certificates Issued</h3>
          <p>
            {students.reduce(
              (sum, s) =>
                sum +
                s.certificates.filter((c) => c.status === 'issued').length,
              0
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
