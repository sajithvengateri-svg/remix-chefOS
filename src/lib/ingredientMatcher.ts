/**
 * Smart ingredient matching utilities
 * Handles fuzzy matching, pluralization, and common variations
 */

// Common ingredient variations and aliases
const INGREDIENT_ALIASES: Record<string, string[]> = {
  tomato: ["tomatoes", "roma tomato", "cherry tomato", "grape tomato", "plum tomato"],
  onion: ["onions", "brown onion", "red onion", "white onion", "spanish onion", "shallot", "shallots"],
  garlic: ["garlic cloves", "garlic clove", "minced garlic", "crushed garlic"],
  potato: ["potatoes", "kipfler", "dutch cream", "desiree", "pontiac"],
  pepper: ["peppers", "capsicum", "bell pepper", "red pepper", "green pepper"],
  chicken: ["chicken breast", "chicken thigh", "chicken drumstick", "chicken wing"],
  beef: ["beef mince", "ground beef", "beef steak", "beef chuck", "beef brisket"],
  oil: ["olive oil", "vegetable oil", "canola oil", "sunflower oil", "cooking oil"],
  butter: ["unsalted butter", "salted butter"],
  cream: ["heavy cream", "thickened cream", "pouring cream", "double cream"],
  milk: ["full cream milk", "skim milk", "whole milk"],
  flour: ["plain flour", "all purpose flour", "self raising flour", "bread flour"],
  sugar: ["white sugar", "caster sugar", "brown sugar", "raw sugar"],
  salt: ["sea salt", "table salt", "kosher salt", "rock salt"],
  cheese: ["cheddar", "parmesan", "mozzarella", "feta", "ricotta", "cream cheese"],
};

// Words to remove for base matching
const STOP_WORDS = ["fresh", "dried", "chopped", "diced", "sliced", "minced", "crushed", "ground", "whole", "organic", "local"];

/**
 * Normalize an ingredient name for matching
 */
export function normalizeIngredientName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Remove stop words
  STOP_WORDS.forEach(word => {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
  });
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Basic singularization
  if (normalized.endsWith('ies')) {
    normalized = normalized.slice(0, -3) + 'y';
  } else if (normalized.endsWith('es') && !normalized.endsWith('ses')) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein distance normalized by max length
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  // Quick checks
  if (longer.includes(shorter)) return 0.9;
  if (shorter.length < 2) return 0;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= shorter.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= longer.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      if (shorter[i - 1] === longer[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[shorter.length][longer.length];
  return 1 - distance / longer.length;
}

export interface IngredientMatch {
  id: string;
  name: string;
  similarity: number;
  matchType: "exact" | "similar" | "alias" | "partial";
}

/**
 * Find matching ingredients from a list
 */
export function findSimilarIngredients(
  searchTerm: string,
  ingredients: { id: string; name: string }[],
  threshold: number = 0.4
): IngredientMatch[] {
  const normalizedSearch = normalizeIngredientName(searchTerm);
  const searchLower = searchTerm.toLowerCase().trim();
  const matches: IngredientMatch[] = [];
  
  for (const ingredient of ingredients) {
    const nameLower = ingredient.name.toLowerCase();
    const normalizedName = normalizeIngredientName(ingredient.name);
    
    // Exact match
    if (nameLower === searchLower || normalizedName === normalizedSearch) {
      matches.push({
        ...ingredient,
        similarity: 1,
        matchType: "exact",
      });
      continue;
    }
    
    // Partial match (search term in name or vice versa)
    if (nameLower.includes(searchLower) || searchLower.includes(nameLower)) {
      matches.push({
        ...ingredient,
        similarity: 0.85,
        matchType: "partial",
      });
      continue;
    }
    
    // Check aliases
    let isAlias = false;
    for (const [base, aliases] of Object.entries(INGREDIENT_ALIASES)) {
      const allVariants = [base, ...aliases];
      const searchInVariants = allVariants.some(v => 
        v.includes(searchLower) || searchLower.includes(v)
      );
      const nameInVariants = allVariants.some(v => 
        v.includes(nameLower) || nameLower.includes(v)
      );
      
      if (searchInVariants && nameInVariants) {
        matches.push({
          ...ingredient,
          similarity: 0.8,
          matchType: "alias",
        });
        isAlias = true;
        break;
      }
    }
    if (isAlias) continue;
    
    // Similarity score
    const similarity = Math.max(
      calculateSimilarity(searchLower, nameLower),
      calculateSimilarity(normalizedSearch, normalizedName)
    );
    
    if (similarity >= threshold) {
      matches.push({
        ...ingredient,
        similarity,
        matchType: "similar",
      });
    }
  }
  
  // Sort by similarity (highest first)
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Infer category from ingredient name
 */
export function inferCategory(name: string): string {
  const nameLower = name.toLowerCase();
  
  const categoryPatterns: Record<string, string[]> = {
    Protein: ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna", "prawn", "shrimp", "bacon", "sausage", "mince"],
    Dairy: ["milk", "cream", "butter", "cheese", "yogurt", "yoghurt"],
    Produce: ["tomato", "onion", "garlic", "potato", "carrot", "celery", "lettuce", "spinach", "broccoli", "pepper", "capsicum", "zucchini", "mushroom", "cucumber", "avocado"],
    Fruit: ["apple", "banana", "orange", "lemon", "lime", "berry", "strawberry", "mango"],
    Pantry: ["flour", "sugar", "salt", "oil", "vinegar", "sauce", "pasta", "rice", "noodle", "bread"],
    Spices: ["pepper", "cumin", "paprika", "cinnamon", "oregano", "basil", "thyme", "rosemary", "chili", "curry"],
    Seafood: ["fish", "salmon", "tuna", "prawn", "shrimp", "crab", "lobster", "mussel", "oyster", "squid"],
  };
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(p => nameLower.includes(p))) {
      return category;
    }
  }
  
  return "Other";
}

/**
 * Infer default unit from ingredient name
 */
export function inferUnit(name: string): string {
  const nameLower = name.toLowerCase();
  
  const unitPatterns: Record<string, string[]> = {
    ml: ["milk", "cream", "oil", "vinegar", "sauce", "stock", "broth", "water", "juice"],
    g: ["flour", "sugar", "butter", "cheese", "mince", "meat", "fish", "chicken", "beef", "pork", "lamb"],
    each: ["egg", "onion", "garlic", "lemon", "lime", "avocado", "apple", "banana", "orange", "tomato", "potato", "carrot"],
    bunch: ["parsley", "coriander", "cilantro", "basil", "mint", "thyme", "rosemary", "chive", "dill"],
  };
  
  for (const [unit, patterns] of Object.entries(unitPatterns)) {
    if (patterns.some(p => nameLower.includes(p))) {
      return unit;
    }
  }
  
  return "g";
}
