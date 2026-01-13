import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import type { ExtractedIdData, OCRResult } from '../types';

interface UseOCRResult {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  processImage: (imageFile: File | string) => Promise<OCRResult>;
  extractIdData: (frontImage: string, backImage?: string, country?: string) => Promise<{
    data: ExtractedIdData | null;
    confidence: number;
  }>;
}

export function useOCR(): UseOCRResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageFile: File | string): Promise<OCRResult> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(
        imageFile,
        'spa+eng', // Spanish and English
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          },
        }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        blocks: result.data.blocks?.map((block) => ({
          text: block.text,
          confidence: block.confidence,
          bbox: block.bbox,
        })) || [],
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error procesando imagen';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, []);

  const extractIdData = useCallback(async (
    frontImage: string,
    backImage?: string,
    country: string = 'MX'
  ): Promise<{ data: ExtractedIdData | null; confidence: number }> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Process front image
      const frontResult = await processImage(frontImage);
      
      // Process back image if provided
      let backResult: OCRResult | null = null;
      if (backImage) {
        backResult = await processImage(backImage);
      }

      // Combine and parse the extracted text
      const combinedText = `${frontResult.text}\n${backResult?.text || ''}`;
      const parsedData = parseIdDocument(combinedText, country);
      
      // Calculate overall confidence
      const confidence = backResult
        ? (frontResult.confidence + backResult.confidence) / 2
        : frontResult.confidence;

      return {
        data: parsedData,
        confidence: confidence / 100, // Normalize to 0-1
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error extrayendo datos';
      setError(errorMessage);
      return { data: null, confidence: 0 };
    } finally {
      setIsProcessing(false);
    }
  }, [processImage]);

  return {
    isProcessing,
    progress,
    error,
    processImage,
    extractIdData,
  };
}

// Helper function to parse ID document text based on country
function parseIdDocument(text: string, country: string): ExtractedIdData | null {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  
  // Common patterns
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g;
  const dates = text.match(datePattern) || [];

  let data: Partial<ExtractedIdData> = {};

  switch (country) {
    case 'MX':
      data = parseMexicanId(text, lines, dates);
      break;
    case 'CR':
      data = parseCostaRicanId(text, lines, dates);
      break;
    default:
      data = parseGenericId(text, lines, dates);
  }

  // Validate we have minimum required data
  if (data.fullName && data.idNumber) {
    return {
      fullName: data.fullName || '',
      idNumber: data.idNumber || '',
      birthDate: data.birthDate || '',
      expiryDate: data.expiryDate || '',
      nationality: data.nationality,
      gender: data.gender,
    };
  }

  return null;
}

function parseMexicanId(text: string, lines: string[], dates: string[]): Partial<ExtractedIdData> {
  const data: Partial<ExtractedIdData> = {};
  
  // Look for CURP pattern (18 characters)
  const curpPattern = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/;
  const curpMatch = text.match(curpPattern);
  if (curpMatch) {
    data.idNumber = curpMatch[0];
    // Extract gender from CURP
    const genderChar = curpMatch[0].charAt(10);
    data.gender = genderChar === 'H' ? 'M' : 'F';
  }

  // Look for voter ID number (Clave de Elector)
  const clavePattern = /[A-Z]{6}\d{8}[A-Z]\d{3}/;
  const claveMatch = text.match(clavePattern);
  if (claveMatch && !data.idNumber) {
    data.idNumber = claveMatch[0];
  }

  // Look for name patterns
  // Usually after "NOMBRE" or in uppercase lines
  const nameKeywords = ['NOMBRE', 'APELLIDO'];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (nameKeywords.some((kw) => line.includes(kw))) {
      // Name might be on next line or same line after keyword
      const nextLine = lines[i + 1];
      if (nextLine && /^[A-ZÁÉÍÓÚÑ\s]+$/.test(nextLine)) {
        data.fullName = (data.fullName ? data.fullName + ' ' : '') + formatName(nextLine);
      }
    }
  }

  // If no name found via keywords, look for lines that appear to be names
  if (!data.fullName) {
    for (const line of lines) {
      if (/^[A-ZÁÉÍÓÚÑ\s]{5,50}$/.test(line) && !line.includes('INSTITUTO') && !line.includes('MEXICO')) {
        data.fullName = formatName(line);
        break;
      }
    }
  }

  // Parse dates
  if (dates.length >= 1) {
    data.birthDate = formatDate(dates[0]);
  }
  if (dates.length >= 2) {
    data.expiryDate = formatDate(dates[dates.length - 1]);
  }

  data.nationality = 'Mexicana';

  return data;
}

function parseCostaRicanId(text: string, lines: string[], dates: string[]): Partial<ExtractedIdData> {
  const data: Partial<ExtractedIdData> = {};

  // Costa Rican ID pattern: X-XXXX-XXXX
  const idPattern = /\d-\d{4}-\d{4}/;
  const idMatch = text.match(idPattern);
  if (idMatch) {
    data.idNumber = idMatch[0];
  }

  // Look for name
  for (const line of lines) {
    if (/^[A-ZÁÉÍÓÚÑ\s]{5,50}$/.test(line)) {
      data.fullName = formatName(line);
      break;
    }
  }

  // Parse dates
  if (dates.length >= 1) {
    data.birthDate = formatDate(dates[0]);
  }
  if (dates.length >= 2) {
    data.expiryDate = formatDate(dates[dates.length - 1]);
  }

  data.nationality = 'Costarricense';

  return data;
}

function parseGenericId(text: string, lines: string[], dates: string[]): Partial<ExtractedIdData> {
  const data: Partial<ExtractedIdData> = {};

  // Try to find any ID-like number pattern
  const idPatterns = [
    /\d{1,2}-\d{4}-\d{4,6}/, // Common Latin American format
    /\d{6,12}/, // Simple numeric ID
    /[A-Z]{2,3}\d{6,10}/, // Alphanumeric ID
  ];

  for (const pattern of idPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.idNumber = match[0];
      break;
    }
  }

  // Look for name (uppercase text that looks like a name)
  for (const line of lines) {
    if (/^[A-ZÁÉÍÓÚÑ\s]{5,50}$/.test(line) && line.split(' ').length >= 2) {
      data.fullName = formatName(line);
      break;
    }
  }

  // Parse dates
  if (dates.length >= 1) {
    data.birthDate = formatDate(dates[0]);
  }
  if (dates.length >= 2) {
    data.expiryDate = formatDate(dates[dates.length - 1]);
  }

  return data;
}

function formatName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateStr: string): string {
  // Try to normalize date format to YYYY-MM-DD
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    
    // Handle 2-digit year
    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const century = parseInt(year) > (currentYear % 100) + 10 ? '19' : '20';
      year = century + year;
    }
    
    // Ensure proper formatting
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}
