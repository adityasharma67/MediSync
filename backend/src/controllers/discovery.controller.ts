import { Request, Response } from 'express';
import recommendationService from '../services/recommendation.service';
import geoService from '../services/geo.service';

export const recommendDoctors = async (req: Request, res: Response) => {
  const symptoms = Array.isArray(req.body.symptoms) ? req.body.symptoms : [];
  const recommendations = await recommendationService.recommendDoctors({
    symptoms,
    limit: req.body.limit,
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
