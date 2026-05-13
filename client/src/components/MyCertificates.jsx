import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyCertificates.css';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/certificate/my-certificates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificates(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch certificates');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateUrl) => {
    window.open(certificateUrl, '_blank');
  };

  const handleShare = (certificate) => {
    const verifyUrl = `${window.location.origin}/verify?cert=${certificate.certificateId}`;
    setShareUrl(verifyUrl);
    setSelectedCert(certificate);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Certificate link copied to clipboard!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading your certificates...</div>;
  }

  return (
    <div className="my-certificates">
      <div className="certificates-header">
        <h1>🎓 My Certificates</h1>
        <button className="refresh-btn" onClick={fetchCertificates}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {certificates.length === 0 ? (
        <div className="no-certificates">
          <div className="empty-state">
            <h2>No Certificates Yet</h2>
            <p>Complete your courses to earn certificates!</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/courses'}
            >
              Explore Courses
            </button>
          </div>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <div key={cert._id} className="certificate-card">
              <div className="cert-icon">
                {cert.status === 'issued' ? '🎓' : '❌'}
              </div>

              <h3 className="cert-title">
                {cert.courseId.title || 'Unknown Course'}
              </h3>

              <div className="cert-details">
                <p>
                  <strong>Certificate ID:</strong>
                  <br />
                  <code>{cert.certificateId}</code>
                </p>
                <p>
                  <strong>Issued Date:</strong>
                  <br />
                  {formatDate(cert.issuedDate)}
                </p>
                {cert.validUntil && (
                  <p>
                    <strong>Valid Until:</strong>
                    <br />
                    {formatDate(cert.validUntil)}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>
                  <br />
                  <span className={`status-badge status-${cert.status}`}>
                    {cert.status.replace('_', ' ')}
                  </span>
                </p>
              </div>

              {cert.status === 'issued' && (
                <div className="cert-actions">
                  <button
                    className="btn btn-download"
                    onClick={() => handleDownload(cert.pdfUrl)}
                  >
                    📥 Download PDF
                  </button>
                  <button
                    className="btn btn-share"
                    onClick={() => handleShare(cert)}
                  >
                    📤 Share
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedCert && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Certificate</h2>
              <button
                className="close-btn"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                Share this link to verify your certificate:
              </p>

              <div className="share-link-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button
                  className="btn btn-copy"
                  onClick={copyToClipboard}
                >
                  📋 Copy
                </button>
              </div>

              <div className="share-options">
                <h4>Share via:</h4>
                <div className="social-buttons">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn linkedin"
                    title="Share on LinkedIn"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=I%20just%20earned%20a%20certificate%20in%20${encodeURIComponent(selectedCert.courseId.title)}!`}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn twitter"
                    title="Share on Twitter"
                  >
                    Twitter
                  </a>
                  <a
                    href={`mailto:?subject=Check my certificate&body=${encodeURIComponent(shareUrl)}`}
                    className="social-btn email"
                    title="Share via Email"
                  >
                    Email
                  </a>
                </div>
              </div>

              <div className="qr-info">
                <p>📱 Anyone with this link can verify your certificate authenticity</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="certificates-summary">
        <div className="summary-card">
          <h3>Total Certificates</h3>
          <p>{certificates.length}</p>
        </div>
        <div className="summary-card">
          <h3>Active Certificates</h3>
          <p>
            {certificates.filter((c) => c.status === 'issued').length}
          </p>
        </div>
        <div className="summary-card">
          <h3>Certificate Validity</h3>
          <p>Lifetime</p>
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;
