import VideoCallRoom from '@/components/consultation/VideoCallRoom';

export default function ConsultationRoom({ params }: { params: { id: string } }) {
  return <VideoCallRoom appointmentId={params.id} />;
}
