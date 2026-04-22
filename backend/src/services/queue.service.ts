import Appointment from '../models/appointment.model';
import Notification from '../models/notification.model';
import WaitlistEntry from '../models/waitlist.model';
import { emitToSlot, emitToUser } from './socket.service';

const getSlotKey = (doctorId: string, date: Date | string, time: string) =>
  `${doctorId}:${new Date(date).toISOString().split('T')[0]}:${time}`;

class QueueService {
  private async getQueueEntries(doctorId: string, date: Date | string, time: string) {
    return WaitlistEntry.find({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: 'waiting',
    }).sort({ priority: -1, createdAt: 1 });
  }

  async joinQueue(payload: {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    symptoms?: string[];
    priority?: number;
  }) {
    const entry = await WaitlistEntry.create({
      patient: payload.patientId,
      doctor: payload.doctorId,
      date: new Date(payload.date),
      time: payload.time,
      symptoms: payload.symptoms || [],
      priority: payload.priority || 0,
      queueType: payload.priority ? 'priority' : 'fifo',
    });

    await this.broadcastQueueState(payload.doctorId, payload.date, payload.time);
    return entry;
  }

  async getQueuePosition(entryId: string) {
    const entry = await WaitlistEntry.findById(entryId);
    if (!entry) {
      throw new Error('Queue entry not found');
    }

    const entries = await this.getQueueEntries(entry.doctor.toString(), entry.date, entry.time);
    const position = entries.findIndex((candidate) => candidate._id.toString() === entryId) + 1;

    return {
      entry,
      position,
      totalWaiting: entries.length,
    };
  }

  async broadcastQueueState(doctorId: string, date: string | Date, time: string) {
    const entries = await this.getQueueEntries(doctorId, date, time);
    const slotKey = getSlotKey(doctorId, date, time);

    entries.forEach((entry, index) => {
      emitToUser(entry.patient.toString(), 'queue:position', {
        queueEntryId: entry._id,
        doctorId,
        date,
        time,
        position: index + 1,
        totalWaiting: entries.length,
      });
    });

    emitToSlot(slotKey, 'queue:updated', {
      doctorId,
      date,
      time,
      totalWaiting: entries.length,
      entries: entries.map((entry, index) => ({
        id: entry._id,
        position: index + 1,
        priority: entry.priority,
        createdAt: (entry as any).createdAt,
      })),
    });
  }

  async assignFreedSlot(doctorId: string, date: string | Date, time: string) {
    const nextEntry = await WaitlistEntry.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: 'waiting',
    }).sort({ priority: -1, createdAt: 1 });

    if (!nextEntry) {
      return null;
    }

    const appointment = await Appointment.create({
      patient: nextEntry.patient,
      doctor: nextEntry.doctor,
      date: new Date(date),
      time,
      status: 'scheduled',
      symptoms: nextEntry.symptoms,
      urgencyLevel: nextEntry.priority > 0 ? 'priority' : 'normal',
      source: 'waitlist-auto',
      queueAssignedAt: new Date(),
    });

    nextEntry.status = 'assigned';
    nextEntry.assignedAppointment = appointment._id as any;
    await nextEntry.save();

    await Notification.create({
      user: nextEntry.patient,
      title: 'Appointment slot assigned',
      message: `A slot became available for ${time} and has been assigned to you automatically.`,
      type: 'appointment',
    });

    emitToUser(nextEntry.patient.toString(), 'queue:assigned', {
      queueEntryId: nextEntry._id,
      appointment,
    });

    await this.broadcastQueueState(doctorId, date, time);
    return appointment;
  }
}

export default new QueueService();
