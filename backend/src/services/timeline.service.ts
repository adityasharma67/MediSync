import Appointment from '../models/appointment.model';
import MedicalReport from '../models/medicalReport.model';
import Prescription from '../models/prescription.model';

class TimelineService {
  async getPatientTimeline(patientId: string) {
    const [appointments, prescriptions, reports] = await Promise.all([
      Appointment.find({ patient: patientId }).populate('doctor', 'name specialization').lean<any[]>(),
      Prescription.find({ patient: patientId }).populate('doctor', 'name specialization').lean<any[]>(),
      MedicalReport.find({ patient: patientId }).lean<any[]>(),
    ]);

    return [
      ...appointments.map((appointment) => ({
        id: appointment._id,
        type: 'appointment',
        title: `Appointment with ${typeof appointment.doctor === 'object' ? appointment.doctor?.name : 'Doctor'}`,
        timestamp: appointment.date,
        payload: appointment,
      })),
      ...prescriptions.map((prescription) => ({
        id: prescription._id,
        type: 'prescription',
        title: `Prescription from ${typeof prescription.doctor === 'object' ? prescription.doctor?.name : 'Doctor'}`,
        timestamp: prescription.createdAt,
        payload: prescription,
      })),
      ...reports.map((report) => ({
        id: report._id,
        type: 'report',
        title: report.title,
        timestamp: report.createdAt,
        payload: report,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export default new TimelineService();
