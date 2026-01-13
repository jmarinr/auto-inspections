import { saveInspection, savePhotos, saveConsent } from './supabase';
import type { Inspection } from '../types';

export async function submitInspectionToSupabase(inspection: Inspection): Promise<string> {
  const inspectionId = `INS-${Date.now().toString(36).toUpperCase()}`;
  
  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + 24);
  
  const riskScore = calculateRiskScore(inspection);
  const qualityScore = calculateQualityScore(inspection);
  const tags = generateTags(inspection);
  
  try {
    await saveInspection({
      id: inspectionId,
      status: 'Pendiente',
      
      client_name: inspection.insuredPerson?.identity.extractedData?.fullName || null,
      client_id: inspection.insuredPerson?.identity.extractedData?.idNumber || null,
      client_phone: inspection.insuredPerson?.phone || null,
      client_email: inspection.insuredPerson?.email || null,
      
      vehicle_vin: inspection.insuredVehicle?.vin || null,
      vehicle_plate: inspection.insuredVehicle?.plate || null,
      vehicle_brand: inspection.insuredVehicle?.brand || null,
      vehicle_model: inspection.insuredVehicle?.model || null,
      vehicle_year: inspection.insuredVehicle?.year || null,
      vehicle_color: inspection.insuredVehicle?.color || null,
      vehicle_mileage: inspection.insuredVehicle?.mileage || null,
      vehicle_usage: 'Particular',
      
      policy_number: inspection.policyNumber || null,
      policy_type: 'Standard',
      policy_status: 'En-Proceso',
      
      risk_score: riskScore,
      quality_score: qualityScore,
      
      accident_type: inspection.accidentType || null,
      accident_date: inspection.createdAt.toISOString(),
      accident_location: inspection.accidentScene?.location.address || null,
      accident_lat: inspection.accidentScene?.location.latitude || null,
      accident_lng: inspection.accidentScene?.location.longitude || null,
      
      client_comments: inspection.accidentScene?.description || null,
      sla_deadline: slaDeadline.toISOString(),
      tags: tags,
      country: inspection.country,
    });
    
    const vehiclePhotos = (inspection.insuredVehicle?.photos || [])
      .filter((p: { imageUrl?: string | null }) => p.imageUrl)
      .map((p: { angle?: string; label?: string; imageUrl?: string | null; timestamp?: Date }) => ({
        inspection_id: inspectionId,
        photo_type: 'vehicle' as const,
        angle: p.angle || null,
        label: p.label || null,
        image_url: p.imageUrl || null,
        timestamp: p.timestamp?.toISOString() || null,
      }));
    
    if (vehiclePhotos.length > 0) {
      await savePhotos(vehiclePhotos);
    }
    
    const scenePhotos = (inspection.accidentScene?.photos || [])
      .filter((p: { imageUrl?: string | null }) => p.imageUrl)
      .map((p: { description?: string; imageUrl?: string | null; location?: { lat?: number; lng?: number }; timestamp?: Date }) => ({
        inspection_id: inspectionId,
        photo_type: 'scene' as const,
        angle: null,
        label: p.description || 'Escena',
        image_url: p.imageUrl || null,
        latitude: p.location?.lat || null,
        longitude: p.location?.lng || null,
        timestamp: p.timestamp?.toISOString() || null,
      }));
    
    if (scenePhotos.length > 0) {
      await savePhotos(scenePhotos);
    }
    
    if (inspection.consent?.accepted) {
      await saveConsent({
        inspection_id: inspectionId,
        person_type: 'insured',
        accepted: true,
        signature_url: inspection.consent.signatureUrl || null,
        timestamp: inspection.consent.timestamp?.toISOString() || new Date().toISOString(),
      });
    }
    
    console.log('✅ Inspección guardada:', inspectionId);
    return inspectionId;
    
  } catch (error) {
    console.error('❌ Error guardando:', error);
    throw error;
  }
}

function calculateRiskScore(inspection: Inspection): number {
  let score = 50;
  
  const mileage = inspection.insuredVehicle?.mileage || 0;
  if (mileage > 100000) score += 20;
  else if (mileage > 50000) score += 10;
  
  const year = inspection.insuredVehicle?.year || new Date().getFullYear();
  const age = new Date().getFullYear() - year;
  if (age > 10) score += 15;
  else if (age > 5) score += 5;
  
  if (inspection.accidentType === 'collision') score += 10;
  
  return Math.min(100, Math.max(0, score));
}

function calculateQualityScore(inspection: Inspection): number {
  let score = 100;
  
  const vehiclePhotos = (inspection.insuredVehicle?.photos || []).filter((p: { imageUrl?: string | null }) => p.imageUrl).length;
  if (vehiclePhotos < 8) score -= (8 - vehiclePhotos) * 5;
  
  if (!inspection.insuredPerson?.identity.validated) score -= 10;
  if (!inspection.insuredVehicle?.plate) score -= 5;
  if (!inspection.accidentScene?.location.address) score -= 5;
  
  return Math.min(100, Math.max(0, score));
}

function generateTags(inspection: Inspection): string[] {
  const tags: string[] = ['Pendiente'];
  
  const mileage = inspection.insuredVehicle?.mileage || 0;
  if (mileage > 80000) tags.push('high-mileage');
  
  const year = inspection.insuredVehicle?.year || new Date().getFullYear();
  if (new Date().getFullYear() - year > 8) tags.push('old-vehicle');
  
  if (inspection.hasThirdParty) tags.push('third-party');
  
  return tags;
}
