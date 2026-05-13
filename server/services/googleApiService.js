const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class GoogleApiService {
  constructor() {
    this.docsService = null;
    this.driveService = null;
    this.auth = null;
    this.initialized = false;
  }

  /**
   * Initialize Google APIs with service account
   */
  async initialize() {
    try {
      const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || path.join(__dirname, '../config/service-account-key.json');

      // Check if file exists
      try {
        await fs.access(keyFilePath);
      } catch {
        logger.error('Service account key file not found. Using environment variables.');
        // Use environment variable for key
        const keyContent = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
        if (!keyContent.type) {
          throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not properly configured');
        }
        this.auth = new google.auth.GoogleAuth({
          credentials: keyContent,
          scopes: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/gmail.send',
          ],
        });
      }

      if (!this.auth) {
        this.auth = new google.auth.GoogleAuth({
          keyFile: keyFilePath,
          scopes: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/gmail.send',
          ],
        });
      }

      // Initialize services
      this.docsService = google.docs({ version: 'v1', auth: this.auth });
      this.driveService = google.drive({ version: 'v3', auth: this.auth });

      this.initialized = true;
      logger.info('Google APIs initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Google APIs:', error);
      throw error;
    }
  }

  /**
   * Copy certificate template document
   * @param {Object} data - Student and course data
   * @returns {Promise<string>} - New document ID
   */
  async copyTemplate(data) {
    try {
      if (!this.initialized) await this.initialize();

      const templateId = process.env.GOOGLE_TEMPLATE_DOC_ID;
      if (!templateId) {
        throw new Error('GOOGLE_TEMPLATE_DOC_ID not configured');
      }

      logger.info(`Copying template ${templateId} for student ${data.studentName}`);

      const response = await this.driveService.files.copy({
        fileId: templateId,
        requestBody: {
          name: `Certificate_${data.studentName.replace(/\s+/g, '_')}_${data.certificateId}`,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
      });

      logger.info(`Template copied successfully: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      logger.error('Error copying template:', error);
      throw new Error(`Failed to copy certificate template: ${error.message}`);
    }
  }

  /**
   * Replace placeholders in document
   * @param {string} docId - Document ID
   * @param {Object} data - Replacement data
   * @returns {Promise<void>}
   */
  async replacePlaceholders(docId, data) {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Replacing placeholders in document ${docId}`);

      const placeholders = {
        '{{NAME}}': data.studentName || 'Student Name',
        '{{COURSE}}': data.courseName || 'Course Name',
        '{{DATE}}': data.issuedDate || new Date().toLocaleDateString(),
        '{{CERTIFICATE_ID}}': data.certificateId || 'CERT-001',
        '{{COMPLETION_DATE}}': data.completionDate || new Date().toLocaleDateString(),
        '{{COURSE_DURATION}}': data.courseDuration || 'Unknown',
        '{{INSTRUCTOR_NAME}}': data.instructorName || 'Instructor',
        '{{SCORE}}': data.score || '100',
        '{{GRADE}}': data.grade || 'Distinction',
      };

      // Build requests for replace all text
      const requests = Object.entries(placeholders).map(([placeholder, value]) => ({
        replaceAllText: {
          containsText: {
            text: placeholder,
            matchCase: false,
          },
          replaceText: String(value),
        },
      }));

      if (requests.length === 0) {
        logger.warn('No placeholders to replace');
        return;
      }

      const response = await this.docsService.documents.batchUpdate({
        documentId: docId,
        requestBody: { requests },
      });

      logger.info(`Placeholders replaced. Replies: ${response.data.replies.length}`);
    } catch (error) {
      logger.error('Error replacing placeholders:', error);
      throw new Error(`Failed to replace placeholders: ${error.message}`);
    }
  }

  /**
   * Export document as PDF
   * @param {string} docId - Document ID
   * @returns {Promise<Buffer>} - PDF file buffer
   */
  async exportAsPDF(docId) {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Exporting document ${docId} as PDF`);

      const response = await this.driveService.files.export({
        fileId: docId,
        mimeType: 'application/pdf',
      }, {
        responseType: 'stream',
      });

      // Convert stream to buffer
      return new Promise((resolve, reject) => {
        const chunks = [];
        response.data
          .on('data', (chunk) => chunks.push(chunk))
          .on('error', reject)
          .on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      logger.error('Error exporting PDF:', error);
      throw new Error(`Failed to export as PDF: ${error.message}`);
    }
  }

  /**
   * Upload PDF to Google Drive
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string} fileName - File name
   * @returns {Promise<Object>} - File information
   */
  async uploadPDF(pdfBuffer, fileName) {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Uploading PDF: ${fileName}`);

      const response = await this.driveService.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/pdf',
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: {
          mimeType: 'application/pdf',
          body: Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer),
        },
      });

      logger.info(`PDF uploaded successfully: ${response.data.id}`);

      return {
        fileId: response.data.id,
        name: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      logger.error('Error uploading PDF:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }

  /**
   * Share file with user
   * @param {string} fileId - File ID
   * @param {string} email - User email
   * @param {string} role - Permission role (reader, writer, commenter)
   * @returns {Promise<void>}
   */
  async shareFile(fileId, email, role = 'reader') {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Sharing file ${fileId} with ${email} as ${role}`);

      await this.driveService.permissions.create({
        fileId,
        requestBody: {
          role,
          type: 'user',
          emailAddress: email,
        },
        fields: 'id',
      });

      logger.info(`File shared successfully with ${email}`);
    } catch (error) {
      if (error.message.includes('403') || error.message.includes('notFound')) {
        logger.warn(`Could not share file: ${error.message}`);
        return; // Non-critical
      }
      logger.error('Error sharing file:', error);
      throw error;
    }
  }

  /**
   * Make file publicly accessible
   * @param {string} fileId - File ID
   * @returns {Promise<string>} - Public URL
   */
  async makePublic(fileId) {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Making file ${fileId} public`);

      await this.driveService.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        fields: 'id',
      });

      const file = await this.driveService.files.get({
        fileId,
        fields: 'webViewLink,webContentLink',
      });

      logger.info(`File made public. Link: ${file.data.webViewLink}`);

      return file.data.webViewLink;
    } catch (error) {
      logger.error('Error making file public:', error);
      throw new Error(`Failed to make file public: ${error.message}`);
    }
  }

  /**
   * Delete a document
   * @param {string} fileId - File ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    try {
      if (!this.initialized) await this.initialize();

      logger.info(`Deleting file ${fileId}`);

      await this.driveService.files.delete({
        fileId,
      });

      logger.info(`File deleted successfully`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get file information
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(fileId) {
    try {
      if (!this.initialized) await this.initialize();

      const response = await this.driveService.files.get({
        fileId,
        fields: 'id,name,webViewLink,webContentLink,mimeType,createdTime,modifiedTime',
      });

      return response.data;
    } catch (error) {
      logger.error('Error getting file info:', error);
      throw error;
    }
  }

  /**
   * Batch delete documents
   * @param {Array<string>} fileIds - Array of file IDs
   * @returns {Promise<Array<Object>>} - Results
   */
  async batchDelete(fileIds) {
    try {
      if (!this.initialized) await this.initialize();

      const results = [];

      for (const fileId of fileIds) {
        try {
          await this.deleteFile(fileId);
          results.push({ fileId, success: true });
        } catch (error) {
          results.push({ fileId, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error in batch delete:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new GoogleApiService();
