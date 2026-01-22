import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import LabReport from '../models/LabReport.js';
import User from '../models/User.js';
import Machine from '../models/Machine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'reports');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (err) {
  console.error('Failed to create uploads directory:', err);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.md', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Markdown, and Text files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload lab report
router.post('/:machineId/upload', upload.single('report'), async (req, res) => {
  try {
    const { machineId } = req.params;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify machine exists
    const machine = await Machine.findById(machineId);
    if (!machine) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: 'Machine not found' });
    }

    // Verify user has solved this machine
    const user = await User.findById(userId);
    const hasSolved = user.solvedVulnerabilities.some(
      v => v.machineId.toString() === machineId
    );

    if (!hasSolved) {
      // Delete uploaded file
      await fs.unlink(req.file.path);
      return res.status(403).json({ error: 'You must solve the machine before uploading a report' });
    }

    // Check if report already exists
    const existingReport = await LabReport.findOne({ userId, machineId });
    if (existingReport) {
      // Delete old file
      try {
        await fs.unlink(existingReport.filePath);
      } catch (err) {
        console.error('Failed to delete old report:', err);
      }
      // Delete old record
      await LabReport.deleteOne({ _id: existingReport._id });
    }

    // Create lab report record
    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
    const labReport = new LabReport({
      userId,
      machineId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: fileExt,
      fileSize: req.file.size
    });

    await labReport.save();

    res.json({
      success: true,
      message: 'Lab report uploaded successfully',
      report: {
        fileName: labReport.fileName,
        fileType: labReport.fileType,
        fileSize: labReport.fileSize,
        uploadedAt: labReport.uploadedAt
      }
    });

  } catch (error) {
    console.error('Report upload error:', error);
    
    // Delete uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Failed to delete file on error:', err);
      }
    }

    res.status(500).json({ error: error.message || 'Server error during upload' });
  }
});

// Get lab report for a machine
router.get('/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const userId = req.userId;

    const report = await LabReport.findOne({ userId, machineId });

    if (!report) {
      return res.status(404).json({ error: 'No report found for this machine' });
    }

    res.json({
      report: {
        fileName: report.fileName,
        fileType: report.fileType,
        fileSize: report.fileSize,
        uploadedAt: report.uploadedAt
      }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Download lab report
router.get('/:machineId/download', async (req, res) => {
  try {
    const { machineId } = req.params;
    const userId = req.userId;

    const report = await LabReport.findOne({ userId, machineId });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if file exists
    try {
      await fs.access(report.filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Report file not found on server' });
    }

    res.download(report.filePath, report.fileName);

  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lab report
router.delete('/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const userId = req.userId;

    const report = await LabReport.findOne({ userId, machineId });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete file
    try {
      await fs.unlink(report.filePath);
    } catch (err) {
      console.error('Failed to delete report file:', err);
    }

    // Delete record
    await LabReport.deleteOne({ _id: report._id });

    res.json({ success: true, message: 'Report deleted successfully' });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
