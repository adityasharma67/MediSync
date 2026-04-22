import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalReport extends Document {
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  title: string;
  fileName: string;
  mimeType: string;
  fileData?: string;
  extractedText: string;
  plainLanguageSummary: string;
  insights: string[];
  sourceType: 'image' | 'pdf' | 'text';
}

const medicalReportSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileData: { type: String },
    extractedText: { type: String, default: '' },
    plainLanguageSummary: { type: String, default: '' },
    insights: [{ type: String }],
    sourceType: {
      type: String,
      enum: ['image', 'pdf', 'text'],
      required: true,
    },
  },
  { timestamps: true }
);

medicalReportSchema.index({ patient: 1, createdAt: -1 });

const MedicalReport = mongoose.model<IMedicalReport>('MedicalReport', medicalReportSchema);
export default MedicalReport;
