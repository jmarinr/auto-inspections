import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values when deploying
// For development, you can use environment variables or hardcode test values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for storage
export const uploadImage = async (
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string }
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: options?.contentType || 'image/jpeg',
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { 
      url: null, 
      error: err instanceof Error ? err.message : 'Error uploading image' 
    };
  }
};

export const deleteImage = async (
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Error deleting image' 
    };
  }
};

// Helper functions for database operations
export const saveInspection = async (inspection: unknown) => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .upsert(inspection)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Error saving inspection' 
    };
  }
};

export const getInspection = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Error fetching inspection' 
    };
  }
};
