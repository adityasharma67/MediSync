import AnalyticsEvent from '../models/analyticsEvent.model';
import Appointment from '../models/appointment.model';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';

class AnalyticsService {
  async track(type: string, payload: { userId?: string; doctorId?: string; metadata?: Record<string, unknown> }) {
    await AnalyticsEvent.create({
      type,
      user: payload.userId,
      doctor: payload.doctorId,
      metadata: payload.metadata,
    });
  }

  async getDashboard() {
    const [appointments, completedAppointments, emergencyAppointments, conversationCount, topDoctors] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ source: 'emergency' }),
      Conversation.countDocuments(),
      User.find({ role: 'doctor' })
        .sort({ 'doctorProfile.rating': -1, 'doctorProfile.reviewCount': -1 })
        .limit(5)
        .select('name specialization doctorProfile.rating doctorProfile.reviewCount'),
    ]);

    const bookingHeatmap = await Appointment.aggregate([
      {
        $group: {
          _id: { hour: { $hour: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
    ]);

    return {
      summary: {
        totalAppointments: appointments,
        completedAppointments,
        emergencyAppointments,
        conversations: conversationCount,
      },
      peakBookingTimes: bookingHeatmap.map((item) => ({
        hour: item._id.hour,
        count: item.count,
      })),
      doctorPerformance: topDoctors,
    };
  }
}

export default new AnalyticsService();
