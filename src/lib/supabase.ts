import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mvcimblwqhyhgjwcxttc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_u6Kgixtcl8BAvJxg1KVyBA_SlKxHDDj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export interface DBInspection {
  id: string;
  created_at: string;
  updated_at: string;
  status: 'Pendiente' | 'En Revisión' | 'Aprobada' | 'Rechazada' | 'Reinspección';
  client_name: string | null;
  client_id: string | null;
  client_phone: string | null;
  client_email: string | null;
  vehicle_vin: string | null;
  vehicle_plate: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_mileage: number | null;
  vehicle_usage: string | null;
  policy_number: string | null;
  policy_type: 'Premium' | 'Standard' | 'Comprehensive';
  policy_status: 'En-Proceso' | 'Emitida' | 'Rechazada' | 'Cancelada';
  risk_score: number;
  quality_score: number;
  accident_type: string | null;
  accident_date: string | null;
  accident_location: string | null;
  accident_lat: number | null;
  accident_lng: number | null;
  client_comments: string | null;
  review_notes: string | null;
  sla_deadline: string | null;
  tags: string[];
  country: string;
}

export interface DBDamage {
  id: string;
  inspection_id: string;
  created_at: string;
  part: string;
  type: string;
  severity: 'Leve' | 'Moderado' | 'Severo' | 'Pérdida total';
  zone: string | null;
  side: 'left' | 'right' | 'center' | 'front' | 'rear' | null;
  confidence: number;
  description: string | null;
  repair_type: string | null;
  affects_structure: boolean;
  affects_mechanical: boolean;
  affects_safety: boolean;
  approved: boolean | null;
}

export interface DBPhoto {
  id: string;
  inspection_id: string;
  created_at: string;
  photo_type: 'vehicle' | 'damage' | 'scene' | 'document';
  angle: string | null;
  label: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string | null;
}

// Funciones helper
export async function saveInspection(inspection: Partial<DBInspection>) {
  const { data, error } = await supabase
    .from('inspections')
    .upsert(inspection)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function saveDamages(damages: Partial<DBDamage>[]) {
  if (damages.length === 0) return [];
  
  const { data, error } = await supabase
    .from('damages')
    .upsert(damages)
    .select();
  
  if (error) throw error;
  return data;
}

export async function savePhotos(photos: Partial<DBPhoto>[]) {
  if (photos.length === 0) return [];
  
  const { data, error } = await supabase
    .from('photos')
    .upsert(photos)
    .select();
  
  if (error) throw error;
  return data;
}

export async function saveConsent(consent: {
  inspection_id: string;
  person_type: 'insured' | 'third_party';
  accepted: boolean;
  signature_url: string | null;
  timestamp: string;
}) {
  const { data, error } = await supabase
    .from('consents')
    .insert(consent)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
