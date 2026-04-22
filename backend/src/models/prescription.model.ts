import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
  pdfUrl?: string; // S3 or local path for the generated PDF
}

const prescriptionSchema: Schema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    notes: { type: String },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
export default Prescription;
