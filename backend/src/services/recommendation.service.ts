import Appointment from '../models/appointment.model';
import User, { IUser } from '../models/user.model';

const normalize = (value: string) => value.trim().toLowerCase();

class RecommendationService {
  private symptomToSpecialization: Record<string, string[]> = {
    fever: ['General Physician', 'Internal Medicine'],
    cough: ['Pulmonologist', 'General Physician'],
    chest_pain: ['Cardiologist', 'Emergency Medicine'],
    skin_rash: ['Dermatologist'],
    anxiety: ['Psychiatrist', 'Psychologist'],
    headache: ['Neurologist', 'General Physician'],
    diabetes: ['Endocrinologist'],
  };

  private availabilityScore(doctor: IUser) {
    return Math.min((doctor.availableSlots?.length || 0) / 10, 1);
  }

  private specializationScore(doctor: IUser, symptoms: string[]) {
    const specialization = normalize(doctor.specialization || doctor.doctorProfile?.bio || '');
    if (!specialization) return 0;

    const desired = symptoms.flatMap((symptom) => this.symptomToSpecialization[normalize(symptom)] || []);
    if (!desired.length) return 0.3;

    return desired.some((value) => specialization.includes(normalize(value))) ? 1 : 0.25;
  }

  private ratingScore(doctor: IUser) {
    return Math.min((doctor.doctorProfile?.rating || 0) / 5, 1);
  }

  async recommendDoctors(input: { symptoms: string[]; limit?: number }) {
    const doctors = await User.find({ role: 'doctor' }).lean<IUser[]>();

    const ranked = doctors.map((doctor) => {
      const score =
        this.specializationScore(doctor as IUser, input.symptoms) * 0.45 +
        this.ratingScore(doctor as IUser) * 0.25 +
        this.availabilityScore(doctor as IUser) * 0.2 +
        Math.min(((doctor.doctorProfile?.reviewCount || 0) / 50), 1) * 0.1;

      return {
        doctor,
        score: Number(score.toFixed(3)),
        reasons: [
          `Specialization match: ${(this.specializationScore(doctor as IUser, input.symptoms) * 100).toFixed(0)}%`,
          `Rating score: ${((doctor.doctorProfile?.rating || 0)).toFixed(1)}/5`,
          `Open slots: ${doctor.availableSlots?.length || 0}`,
        ],
      };
    });

    return ranked
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit || 5);
  }

  async getDoctorPerformanceSnapshot(doctorId: string) {
    const [appointments, completed] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
    ]);

    return {
      totalAppointments: appointments,
      completedAppointments: completed,
      completionRate: appointments ? Number((completed / appointments).toFixed(2)) : 0,
    };
  }
}

export default new RecommendationService();
