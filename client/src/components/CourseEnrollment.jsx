import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseEnrollment.css';

const CourseEnrollment = ({ courseId, courseName, coursePrice, onEnrollmentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const studentData = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    checkCourseAccess();
  }, [courseId]);

  const checkCourseAccess = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/payment/check-access/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHasAccess(response.data.data.hasAccess);
      setStudentInfo(studentData);
    } catch (err) {
      console.error('Error checking access:', err);
      setError(err.response?.data?.message || 'Error checking course access');
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      alert('Please login first');
      window.location.href = '/login';
      return;
    }

    // Check if course is free
    if (coursePrice === 0) {
      await enrollFreeCourse();
      return;
    }

    // Paid course - initiate Razorpay payment
    await initiatePayment();
  };

  const enrollFreeCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE}/payment/create-order`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Successfully enrolled in the course!');
      setHasAccess(true);
      onEnrollmentSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order
      const orderResponse = await axios.post(
        `${API_BASE}/payment/create-order`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { orderId, amount, studentName, studentEmail } = orderResponse.data.data;
      setOrderId(orderId);

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        name: 'E-Learning Platform',
        description: `Enrollment for ${courseName}`,
        order_id: orderId,
        prefill: {
          name: studentName,
          email: studentEmail,
        },
        handler: (response) => handlePaymentSuccess(response),
        modal: {
          ondismiss: () => {
            setPaymentInitiated(false);
            setLoading(false);
          },
        },
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        setPaymentInitiated(true);
        razorpay.open();
      } else {
        setError('Razorpay script not loaded. Please refresh the page.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);

      // Verify payment
      const verifyResponse = await axios.post(
        `${API_BASE}/payment/verify`,
        {
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('🎉 Payment successful! You are now enrolled in the course.');
      setHasAccess(true);
      setPaymentInitiated(false);
      onEnrollmentSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
      console.error('Error:', err);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-enrollment">
      {error && <div className="alert alert-error">{error}</div>}

      {hasAccess ? (
        <div className="enrollment-success">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3>You're Enrolled!</h3>
            <p>You have access to all course materials and content.</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="enrollment-card">
          <div className="course-header">
            <h2>{courseName}</h2>
            <div className="price-section">
              {coursePrice === 0 ? (
                <span className="free-badge">FREE</span>
              ) : (
                <>
                  <span className="price">₹{coursePrice}</span>
                  <span className="price-label">One-time payment</span>
                </>
              )}
            </div>
          </div>

          <div className="features-list">
            <h4>Course Includes:</h4>
            <ul>
              <li>✓ Lifetime access to course materials</li>
              <li>✓ Certificate of completion</li>
              <li>✓ Video lectures and resources</li>
              <li>✓ Assignments and quizzes</li>
              <li>✓ 30-day money-back guarantee</li>
              <li>✓ Lifetime email support</li>
            </ul>
          </div>

          <div className="enrollment-info">
            {studentInfo && (
              <>
                <p>
                  <strong>Enrolling as:</strong> {studentInfo.firstName} {studentInfo.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {studentInfo.email}
                </p>
              </>
            )}
          </div>

          <button
            className="btn btn-enroll"
            onClick={handleEnroll}
            disabled={loading || paymentInitiated}
          >
            {loading ? 'Processing...' : coursePrice === 0 ? 'Enroll Free' : 'Pay Now'}
          </button>

          <div className="security-info">
            <p>🔒 Secure payment powered by Razorpay</p>
          </div>

          {coursePrice > 0 && (
            <div className="refund-policy">
              <h5>30-Day Money-Back Guarantee</h5>
              <p>
                Not satisfied with the course? Get a full refund within 30 days of purchase.
                No questions asked!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollment;
