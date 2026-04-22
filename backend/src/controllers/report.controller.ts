import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import reportService from '../services/report.service';
import MedicalReport from '../models/medicalReport.model';

export const analyzeReport = async (req: AuthRequest, res: Response) => {
  const report = await reportService.analyze({
    patientId: req.user._id.toString(),
    title: req.body.title,
    fileName: req.body.fileName,
    mimeType: req.body.mimeType,
    fileData: req.body.fileData,
    appointmentId: req.body.appointmentId,
    ocrText: req.body.ocrText,
  });

  res.status(201).json(report);
};

export const getMyReports = async (req: AuthRequest, res: Response) => {
  const reports = await MedicalReport.find({ patient: req.user._id }).sort({ createdAt: -1 });
  res.json(reports);
};
