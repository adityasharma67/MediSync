import { Request, Response } from 'express';
import recommendationService from '../services/recommendation.service';
import geoService from '../services/geo.service';

export const recommendDoctors = async (req: Request, res: Response) => {
  const rawSymptoms = req.body.symptoms ?? req.query.symptoms;
  const symptoms = Array.isArray(rawSymptoms)
    ? rawSymptoms
    : typeof rawSymptoms === 'string'
      ? rawSymptoms.split(',').map((symptom) => symptom.trim()).filter(Boolean)
      : [];
  const recommendations = await recommendationService.recommendDoctors({
    symptoms,
    limit: Number(req.body.limit ?? req.query.limit) || undefined,
  });

  res.json(recommendations);
};

export const findNearbyDoctors = async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const maxDistanceKm = Number(req.query.maxDistanceKm || 25);

  const doctors = await geoService.findNearbyDoctors(lat, lng, maxDistanceKm);
  res.json(doctors);
};
