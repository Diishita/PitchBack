import { api } from '../services/api';

export const getMatchRecommendation = async (userProfile) => (
  (await api.ai.matchRecommendation(userProfile)).recommendation
);

export const getFitnessSafetyAdvisor = async (matchFormat, physicalConstraints) => (
  (await api.ai.fitnessAdvice(matchFormat, physicalConstraints)).routine
);