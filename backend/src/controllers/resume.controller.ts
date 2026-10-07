import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { analyzeResume, extractTextFromPdf, JOB_ROLES } from '../services/resume.service.js';

// POST /api/resume/parse-pdf
export async function parsePdfController(req: AuthRequest, res: Response) {
  try {
    const { pdf_base64 } = req.body;
    if (!pdf_base64 || typeof pdf_base64 !== 'string') {
      return res.status(400).json({ error: 'Please provide valid PDF data in base64 format.' });
    }

    // Strip data URI scheme prefix if present
    const cleanBase64 = pdf_base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'PDF file data is empty.' });
    }

    const text = await extractTextFromPdf(buffer);
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'No readable text found in this PDF. It might be a scanned image or protected.',
      });
    }

    res.json({ text, character_count: text.length });
  } catch (error: any) {
    console.error('PDF parsing error:', error?.message || error);
    res.status(500).json({ error: 'Failed to extract text from PDF: ' + (error?.message || 'unknown error') });
  }
}

// GET /api/resume/roles
export async function getJobRolesController(_req: AuthRequest, res: Response) {
  res.json({ roles: JOB_ROLES });
}

// POST /api/resume/analyze
export async function analyzeResumeController(req: AuthRequest, res: Response) {
  try {
    const { resume_text, job_role } = req.body;

    if (!resume_text || typeof resume_text !== 'string' || resume_text.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a resume with at least 50 characters.' });
    }

    if (!job_role || !JOB_ROLES.includes(job_role)) {
      return res.status(400).json({ error: `Invalid job role. Choose from: ${JOB_ROLES.join(', ')}` });
    }

    const result = await analyzeResume(resume_text.trim(), job_role);
    res.json(result);
  } catch (error: any) {
    console.error('Resume analysis error:', error?.message || error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume. Please try again.' });
  }
}
