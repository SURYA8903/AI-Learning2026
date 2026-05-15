const certificateService = require('../services/certificateService');
const emailService = require('../services/emailService');
const logger = require('../services/logger');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

/**
 * GENERATE CERTIFICATE
 * POST /api/certificate/generate/:studentId/:courseId
 * Admin only
 */
exports.generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Course ID are required',
      });
    }

    // Fetch student and course
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({
        success: false,
        message: 'Student or Course not found',
      });
    }

    // Get enrollment
    const enrollment = student.enrolledCourses.find(
      (e) => e.courseId.toString() === courseId
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course',
      });
    }

    // Check if certificate already issued
    const existingCert = student.certificates.find(
      (cert) => cert.courseId.toString() === courseId && cert.status === 'issued'
    );

    if (existingCert) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this course',
        data: existingCert,
      });
    }

    logger.info(`Starting certificate generation for student ${studentId}`);

    // Generate certificate
    const certificateData = await certificateService.generateCertificate(studentId, courseId);

    // Save to database
    const savedCert = await certificateService.saveCertificate(studentId, certificateData);

    // Update enrollment status
    enrollment.status = 'certificate_issued';
    await student.save();

    // Update course stats
    await Course.updateOne(
      { _id: courseId },
      { $inc: { 'stats.certificatesIssued': 1 } }
    );

    // Send email
    await emailService.sendCertificateEmail({
      studentEmail: student.email,
      studentName: student.fullName,
      courseName: course.title,
      certificateId: savedCert.certificateId,
      certificateUrl: savedCert.pdfUrl,
      issuedDate: savedCert.issuedDate,
    });

    logger.info(`Certificate generated and sent to ${student.email}`);

    res.status(200).json({
      success: true,
      message: 'Certificate generated and sent successfully',
      data: savedCert,
    });
  } catch (error) {
    logger.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message,
    });
  }
};

/**
 * GET STUDENT CERTIFICATES
 * GET /api/certificate/my-certificates
 */
exports.getStudentCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;

    const certificates = await certificateService.getStudentCertificates(studentId);

    res.status(200).json({
      success: true,
      message: 'Certificates retrieved',
      data: certificates,
    });
  } catch (error) {
    logger.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message,
    });
  }
};

/**
 * VERIFY CERTIFICATE
 * GET /api/certificate/verify/:certificateId
 * Public endpoint
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required',
      });
    }

    const verification = await certificateService.verifyCertificate(certificateId);

    if (verification.isValid) {
      res.status(200).json({
        success: true,
        message: 'Certificate verified',
        data: verification,
      });
    } else {
      res.status(400).json({
        success: false,
        message: verification.message,
        data: verification,
      });
    }
  } catch (error) {
    logger.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Certificate verification failed',
      error: error.message,
    });
  }
};

/**
 * REVOKE CERTIFICATE
 * POST /api/certificate/revoke/:studentId/:certificateId
 * Admin only
 */
exports.revokeCertificate = async (req, res) => {
  try {
    const { studentId, certificateId } = req.params;
    const { reason } = req.body;

    if (!studentId || !certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Certificate ID are required',
      });
    }

    const revoked = await certificateService.revokeCertificate(
      studentId,
      certificateId,
      reason || ''
    );

    logger.info(`Certificate ${certificateId} revoked by admin`);

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: revoked,
    });
  } catch (error) {
    logger.error('Error revoking certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate',
      error: error.message,
    });
  }
};

/**
 * DOWNLOAD CERTIFICATE
 * GET /api/certificate/download/:certificateId
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const studentId = req.user?.id;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required',
      });
    }

    // Find certificate
    const student = await Student.findOne({
      'certificates.certificateId': certificateId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const certificate = student.certificates.find(
      (cert) => cert.certificateId === certificateId
    );

    // Check access rights
    if (studentId && student._id.toString() !== studentId) {
      // Only allow if certificate is not revoked/expired
      if (certificate.status !== 'issued') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access',
        });
      }
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: 'Certificate has been revoked',
      });
    }

    // Redirect to PDF URL
    res.redirect(certificate.pdfUrl);
  } catch (error) {
    logger.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message,
    });
  }
};

/**
 * BULK GENERATE CERTIFICATES
 * POST /api/certificate/bulk-generate
 * Admin only
 */
exports.bulkGenerateCertificates = async (req, res) => {
  try {
    const { enrollments } = req.body;

    if (!Array.isArray(enrollments) || enrollments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enrollments array is required',
      });
    }

    logger.info(`Starting bulk certificate generation for ${enrollments.length} enrollments`);

    const results = await certificateService.bulkGenerateCertificates(enrollments);

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    logger.info(`Bulk generation completed: ${successCount} success, ${failureCount} failures`);

    res.status(200).json({
      success: true,
      message: `Bulk generation completed: ${successCount} success, ${failureCount} failures`,
      data: {
        total: results.length,
        success: successCount,
        failed: failureCount,
        results,
      },
    });
  } catch (error) {
    logger.error('Error in bulk generation:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk certificate generation failed',
      error: error.message,
    });
  }
};

/**
 * UPDATE STUDENT STATUS AND AUTO-GENERATE CERTIFICATE
 * PUT /api/certificate/update-status/:studentId/:courseId
 * Admin only
 */
exports.updateStatusAndGenerateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { status, completionDate, progress } = req.body;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({
        success: false,
        message: 'Student or Course not found',
      });
    }

    // Update enrollment status
    const enrollment = student.enrolledCourses.find(
      (e) => e.courseId.toString() === courseId
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student not enrolled in this course',
      });
    }

    enrollment.status = status;
    if (completionDate) enrollment.completionDate = new Date(completionDate);
    if (progress !== undefined) enrollment.progress = progress;

    // Auto-generate certificate if status is "completed"
    let certificate = null;
    if (status === 'completed' && course.certificate?.isEnabled) {
      try {
        logger.info(`Auto-generating certificate for student ${studentId}`);

        const certificateData = await certificateService.generateCertificate(studentId, courseId);
        certificate = await certificateService.saveCertificate(studentId, certificateData);

        // Update enrollment status to certificate_issued
        enrollment.status = 'certificate_issued';

        // Update course stats
        await Course.updateOne(
          { _id: courseId },
          { $inc: { 'stats.certificatesIssued': 1, 'stats.totalCompletions': 1 } }
        );

        // Send certificate email
        await emailService.sendCertificateEmail({
          studentEmail: student.email,
          studentName: student.fullName,
          courseName: course.title,
          certificateId: certificate.certificateId,
          certificateUrl: certificate.pdfUrl,
          issuedDate: certificate.issuedDate,
        });

        logger.info(`Certificate auto-generated and emailed to ${student.email}`);
      } catch (certError) {
        logger.warn(`Certificate auto-generation failed: ${certError.message}`);
        // Continue without certificate
      }
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully' + (certificate ? ' and certificate generated' : ''),
      data: {
        student: {
          id: student._id,
          name: student.fullName,
        },
        enrollment: {
          courseId,
          status: enrollment.status,
          progress: enrollment.progress,
          completionDate: enrollment.completionDate,
        },
        certificate,
      },
    });
  } catch (error) {
    logger.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

/**
 * GET CERTIFICATE STATS
 * GET /api/certificate/stats
 * Admin only
 */
exports.getCertificateStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      { $unwind: '$certificates' },
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          issuedCount: {
            $sum: {
              $cond: [{ $eq: ['$certificates.status', 'issued'] }, 1, 0],
            },
          },
          revokedCount: {
            $sum: {
              $cond: [{ $eq: ['$certificates.status', 'revoked'] }, 1, 0],
            },
          },
          expiredCount: {
            $sum: {
              $cond: [{ $eq: ['$certificates.status', 'expired'] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Certificate stats retrieved',
      data: stats[0] || {
        totalCertificates: 0,
        issuedCount: 0,
        revokedCount: 0,
        expiredCount: 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching certificate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate stats',
      error: error.message,
    });
  }
};
