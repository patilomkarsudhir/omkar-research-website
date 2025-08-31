/**
 * Utility functions for matching publications to PDF files
 */

// Function for normalizing titles for matching
export function normalizeForMatching(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')  // Remove all punctuation
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim();
}

// Function to get PDF URL for a publication
export function getPdfUrl(publication: { title: string }, mapping: Record<string, string>): string | null {
  const normalizedTitle = normalizeForMatching(publication.title);
  const filename = mapping[normalizedTitle];
  
  if (filename) {
    return `/publications/papers/${filename}`;
  }
  
  return null;
}

// Load the mapping from API route
export async function loadPaperMapping(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/paper-mapping');
    if (!response.ok) {
      console.warn('Could not load paper mapping file');
      return {};
    }
    const mapping = await response.json();
    
    // Filter out comment entries
    const cleanMapping: Record<string, string> = {};
    for (const [key, value] of Object.entries(mapping)) {
      if (!key.startsWith('//') && typeof value === 'string') {
        cleanMapping[key] = value;
      }
    }
    
    return cleanMapping;
  } catch (error) {
    console.warn('Error loading paper mapping:', error);
    return {};
  }
}
