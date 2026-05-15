const crypto = require('crypto');
const googleApiService = require('./googleApiService');
const logger = require('./logger');
const Student = require('../models/Student');
const Course = require('../models/Course');

class CertificateService {
  /**
   * Generate unique certificate ID
   * @returns {string} - Unique certificate ID
   */
  static generateCertificateId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CERT-${timestamp}-${randomPart}`;
  }

  /**
   * Check if certificate can be issued
   * @param {Object} student - Student document
   * @param {Object} course - Course document
   * @param {Object} enrollment - Enrollment object
   * @returns {Object} - Validation result
   */
  static validateCertificateIssuance(student, course, enrollment) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check if course has certificates enabled
    if (!course.certificate?.isEnabled) {
      validation.isValid = false;
      validation.errors.push('Certificates are not enabled for this course');
    }

    // Check completion percentage
    const minCompletion = course.certificate?.criteriaToIssue?.minCompletionPercentage || 80;
    if (enrollment.progress < minCompletion) {
      validation.isValid = false;
      validation.errors.push(
        `Completion must be at least ${minCompletion}%. Current: ${enrollment.progress}%`
      );
    }

    // Check if already issued
    const existingCert = student.certificates?.find(
      (cert) => cert.courseId.toString() === course._id.toString() && cert.status === 'issued'
    );
    if (existingCert) {
      validation.warnings.push('Certificate already issued for this course');
    }

    return validation;
  }

  /**
   * Generate certificate for student
   * @param {string} studentId - Student ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} - Certificate data
   */
  static async generateCertificate(studentId, courseId) {
    const certificateId = this.generateCertificateId();
    let googleDocId = null;
    let pdfUrl = null;
    let driveFileId = null;

    try {
      logger.info(
        `Starting certificate generation for student ${studentId}, course ${courseId}`
      );

      // Fetch student and course
      const student = await Student.findById(studentId).lean();
      const course = await Course.findById(courseId).lean();

      if (!student) {
        throw new Error('Student not found');
      }
      if (!course) {
        throw new Error('Course not found');
      }

      // Get enrollment
      const enrollment = student.enrolledCourses?.find(
        (e) => e.courseId.toString() === courseId
      );
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Validate certificate issuance
      const validation = this.validateCertificateIssuance(student, course, enrollment);
      if (!validation.isValid) {
        const errors = validation.errors.join('; ');
        throw new Error(`Certificate issuance validation failed: ${errors}`);
      }

      // Prepare data for certificate
      const certificateData = {
        studentName: `${student.firstName} ${student.lastName}`,
        courseName: course.title,
        certificateId,
        issuedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        completionDate: enrollment.completionDate?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) || new Date().toLocaleDateString(),
        courseDuration: `${course.duration?.value || 'N/A'} ${course.duration?.unit || 'weeks'}`,
        instructorName: course.instructorName || 'Instructor',
        score: '100',
        grade: 'Distinction',
      };

      logger.info(`Certificate data prepared: ${JSON.stringify(certificateData)}`);

      // Copy template from Google Docs
      logger.info('Copying certificate template from Google Docs');
      googleDocId = await googleApiService.copyTemplate(certificateData);

      // Replace placeholders
      logger.info('Replacing placeholders in certificate');
      await googleApiService.replacePlaceholders(googleDocId, certificateData);

      // Export as PDF
      logger.info('Exporting certificate as PDF');
      const pdfBuffer = await googleApiService.exportAsPDF(googleDocId);

      // Upload PDF to Google Drive
      const fileName = `${student.firstName}_${student.lastName}_${course.title
        .replace(/\s+/g, '_')
        .substring(0, 20)}_${certificateId}.pdf`;

      logger.info(`Uploading PDF with filename: ${fileName}`);
      const uploadResult = await googleApiService.uploadPDF(pdfBuffer, fileName);

      driveFileId = uploadResult.fileId;
      pdfUrl = uploadResult.webViewLink;

      // Make PDF publicly accessible
      logger.info('Making PDF publicly accessible');
      await googleApiService.makePublic(driveFileId);

      // Delete the temporary Google Doc (optional - can keep for record)
      try {
        await googleApiService.deleteFile(googleDocId);
        logger.info('Temporary Google Doc deleted');
      } catch (deleteError) {
        logger.warn('Failed to delete temporary document:', deleteError.message);
        // Non-critical error, continue
      }

      logger.info(`Certificate generated successfully: ${certificateId}`);

      return {
        certificateId,
        googleDocId,
        driveFileId,
        pdfUrl,
        issuedDate: new Date(),
        studentId,
        courseId,
        studentName: certificateData.studentName,
        courseName: certificateData.courseName,
      };
    } catch (error) {
      logger.error('Certificate generation failed:', error);

      // Cleanup on error
      if (googleDocId) {
        try {
          await googleApiService.deleteFile(googleDocId);
        } catch (cleanupError) {
          logger.warn('Cleanup failed:', cleanupError.message);
        }
      }

      throw error;
    }
  }

  /**
   * Save certificate to database
   * @param {string} studentId - Student ID
   * @param {Object} certificateData - Certificate data
   * @returns {Promise<Object>} - Updated certificate
   */
  static async saveCertificate(studentId, certificateData) {
    try {
      logger.info(`Saving certificate to database for student ${studentId}`);

      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const validityYears = 1; // Can be made configurable
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + validityYears);

      const certificate = {
        courseId: certificateData.courseId,
        certificateId: certificateData.certificateId,
        googleDocId: certificateData.googleDocId,
        pdfUrl: certificateData.pdfUrl,
        driveFileId: certificateData.driveFileId,
        issuedDate: new Date(),
        validUntil,
        status: 'issued',
      };

      // Add certificate to student
      student.certificates.push(certificate);

      // Update enrollment status
      const enrollment = student.enrolledCourses.find(
        (e) => e.courseId.toString() === certificateData.courseId.toString()
      );
      if (enrollment) {
        enrollment.status = 'certificate_issued';
      }

      await student.save();

      logger.info(`Certificate saved successfully for student ${studentId}`);

      return certificate;
    } catch (error) {
      logger.error('Error saving certificate:', error);
      throw error;
    }
  }

  /**
   * Revoke certificate
   * @param {string} studentId - Student ID
   * @param {string} certificateId - Certificate ID
   * @param {string} reason - Revocation reason
   * @returns {Promise<Object>} - Updated certificate
   */
  static async revokeCertificate(studentId, certificateId, reason = '') {
    try {
      logger.info(
        `Revoking certificate ${certificateId} for student ${studentId}. Reason: ${reason}`
      );

      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const certificate = student.certificates.find(
        (cert) => cert.certificateId === certificateId
      );
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      certificate.status = 'revoked';
      certificate.revokedAt = new Date();
      certificate.revocationReason = reason;

      await student.save();

      logger.info(`Certificate revoked successfully`);

      return certificate;
    } catch (error) {
      logger.error('Error revoking certificate:', error);
      throw error;
    }
  }

  /**
   * Get student certificates
   * @param {string} studentId - Student ID
   * @returns {Promise<Array>} - Array of certificates
   */
  static async getStudentCertificates(studentId) {
    try {
      const student = await Student.findById(studentId)
        .select('certificates enrolledCourses')
        .populate({
          path: 'certificates.courseId',
          select: 'title description',
        });

      if (!student) {
        throw new Error('Student not found');
      }

      return student.certificates || [];
    } catch (error) {
      logger.error('Error fetching certificates:', error);
      throw error;
    }
  }

  /**
   * Verify certificate authenticity
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Object>} - Verification result
   */
  static async verifyCertificate(certificateId) {
    try {
      const student = await Student.findOne({
        'certificates.certificateId': certificateId,
      });

      if (!student) {
        return {
          isValid: false,
          message: 'Certificate not found',
        };
      }

      const certificate = student.certificates.find((c) => c.certificateId === certificateId);

      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found',
        };
      }

      if (certificate.status === 'revoked') {
        return {
          isValid: false,
          message: 'Certificate has been revoked',
          revokedAt: certificate.revokedAt,
          revokedReason: certificate.revocationReason,
        };
      }

      if (certificate.validUntil && certificate.validUntil < new Date()) {
        return {
          isValid: false,
          message: 'Certificate has expired',
          expiredAt: certificate.validUntil,
        };
      }

      // Get course information
      const course = await Course.findById(certificate.courseId).select('title');

      return {
        isValid: true,
        message: 'Certificate is valid',
        certificateId,
        studentName: `${student.firstName} ${student.lastName}`,
        courseName: course?.title,
        issuedDate: certificate.issuedDate,
        validUntil: certificate.validUntil,
        pdfUrl: certificate.pdfUrl,
      };
    } catch (error) {
      logger.error('Error verifying certificate:', error);
      return {
        isValid: false,
        message: 'Verification failed',
        error: error.message,
      };
    }
  }

  /**
   * Bulk generate certificates
   * @param {Array<Object>} enrollments - Array of enrollment objects
   * @returns {Promise<Array<Object>>} - Results
   */
  static async bulkGenerateCertificates(enrollments) {
    const results = [];

    for (const enrollment of enrollments) {
      try {
        const certificateData = await this.generateCertificate(
          enrollment.studentId,
          enrollment.courseId
        );
        const savedCert = await this.saveCertificate(enrollment.studentId, certificateData);
        results.push({
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          success: true,
          certificateId: savedCert.certificateId,
          pdfUrl: savedCert.pdfUrl,
        });
      } catch (error) {
        results.push({
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = CertificateService;
