import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, 'Doctor ID is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
  }),
});

export const updateAppointmentSchema = z.object({
  body: z
    .object({
      status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
      date: z.string().optional(),
      time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format').optional(),
      meetLink: z.string().url('meetLink must be a valid URL').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required for update',
    }),
});
