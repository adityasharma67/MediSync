import User from '../models/user.model';

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

class GeoService {
  async findNearbyDoctors(lat: number, lng: number, maxDistanceKm = 25) {
    const doctors = await User.find({
      role: 'doctor',
      'doctorProfile.location.lat': { $exists: true },
      'doctorProfile.location.lng': { $exists: true },
    }).lean();

    return doctors
      .map((doctor) => {
        const location = doctor.doctorProfile?.location;
        const distanceKm = location
          ? haversineDistanceKm(lat, lng, location.lat, location.lng)
          : Number.POSITIVE_INFINITY;

        return {
          ...doctor,
          distanceKm: Number(distanceKm.toFixed(2)),
          googleMapsUrl: location
            ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
            : null,
        };
      })
      .filter((doctor) => doctor.distanceKm <= maxDistanceKm)
      .sort((a, b) => {
        const ratingDiff = (b.doctorProfile?.rating || 0) - (a.doctorProfile?.rating || 0);
        if (Math.abs(a.distanceKm - b.distanceKm) < 1) {
          return ratingDiff;
        }
        return a.distanceKm - b.distanceKm;
      });
  }
}

export default new GeoService();
