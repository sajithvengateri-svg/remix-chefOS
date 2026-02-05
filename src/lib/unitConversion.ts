 // Unit conversion utility for accurate recipe costing
 // Handles conversions between mass and volume units
 
 type MassUnit = 'g' | 'kg' | 'lb' | 'oz';
 type VolumeUnit = 'ml' | 'L' | 'tsp' | 'tbsp' | 'cup';
 type CountUnit = 'each' | 'bunch' | 'case';
 
 export type Unit = MassUnit | VolumeUnit | CountUnit;
 
 // Conversion factors to base units (g for mass, ml for volume)
 const massToGrams: Record<MassUnit, number> = {
   g: 1,
   kg: 1000,
   lb: 453.592,
   oz: 28.3495,
 };
 
 const volumeToMl: Record<VolumeUnit, number> = {
   ml: 1,
   L: 1000,
   tsp: 4.92892,
   tbsp: 14.7868,
   cup: 236.588,
 };
 
 const massUnits = new Set<string>(['g', 'kg', 'lb', 'oz']);
 const volumeUnits = new Set<string>(['ml', 'L', 'tsp', 'tbsp', 'cup']);
 const countUnits = new Set<string>(['each', 'bunch', 'case']);
 
 export function getUnitType(unit: string): 'mass' | 'volume' | 'count' | 'unknown' {
   if (massUnits.has(unit)) return 'mass';
   if (volumeUnits.has(unit)) return 'volume';
   if (countUnits.has(unit)) return 'count';
   return 'unknown';
 }
 
 export function areUnitsCompatible(unit1: string, unit2: string): boolean {
   const type1 = getUnitType(unit1);
   const type2 = getUnitType(unit2);
   
   // Same type = compatible
   if (type1 === type2) return true;
   
   // Unknown units are only compatible with themselves
   return false;
 }
 
 /**
  * Convert a quantity from one unit to another
  * Returns null if units are incompatible
  */
 export function convertUnit(
   quantity: number,
   fromUnit: string,
   toUnit: string
 ): number | null {
   // Same unit, no conversion needed
   if (fromUnit === toUnit) return quantity;
   
   const fromType = getUnitType(fromUnit);
   const toType = getUnitType(toUnit);
   
   // Incompatible units
   if (fromType !== toType) return null;
   
   // Count units don't convert between each other
   if (fromType === 'count') return null;
   
   // Mass conversion
   if (fromType === 'mass') {
     const inGrams = quantity * massToGrams[fromUnit as MassUnit];
     return inGrams / massToGrams[toUnit as MassUnit];
   }
   
   // Volume conversion
   if (fromType === 'volume') {
     const inMl = quantity * volumeToMl[fromUnit as VolumeUnit];
     return inMl / volumeToMl[toUnit as VolumeUnit];
   }
   
   return null;
 }
 
 /**
  * Calculate the cost of a recipe ingredient, accounting for unit differences
  * 
  * @param recipeQty - Quantity used in the recipe
  * @param recipeUnit - Unit used in the recipe (e.g., "g")
  * @param costPerUnit - Cost per unit of the ingredient
  * @param ingredientUnit - Unit the ingredient is priced in (e.g., "kg")
  * @returns The calculated line cost, or null if units are incompatible
  */
 export function calculateIngredientCost(
   recipeQty: number,
   recipeUnit: string,
   costPerUnit: number,
   ingredientUnit: string
 ): number | null {
   // Same unit - simple multiplication
   if (recipeUnit === ingredientUnit) {
     return recipeQty * costPerUnit;
   }
   
   // Convert recipe quantity to ingredient's unit
   const convertedQty = convertUnit(recipeQty, recipeUnit, ingredientUnit);
   
   if (convertedQty === null) {
     // Incompatible units - fall back to direct multiplication with a warning
     console.warn(
       `Unit mismatch: recipe uses "${recipeUnit}" but ingredient is priced per "${ingredientUnit}". ` +
       `Falling back to direct multiplication which may be incorrect.`
     );
     return recipeQty * costPerUnit;
   }
   
   return convertedQty * costPerUnit;
 }
 
 /**
  * Format a quantity with appropriate decimal places based on the unit
  */
 export function formatQuantity(quantity: number, unit: string): string {
   // Large units (kg, L) typically need more precision
   if (['kg', 'L', 'lb'].includes(unit)) {
     return quantity.toFixed(3);
   }
   // Small units (g, ml, oz) need less precision
   if (['g', 'ml', 'oz'].includes(unit)) {
     return quantity.toFixed(1);
   }
   // Count units should be whole numbers or simple decimals
   return quantity.toFixed(2);
 }
 
 /**
  * Get a user-friendly display of the conversion for debugging/transparency
  */
 export function getConversionExplanation(
   recipeQty: number,
   recipeUnit: string,
   ingredientUnit: string
 ): string | null {
   if (recipeUnit === ingredientUnit) return null;
   
   const converted = convertUnit(recipeQty, recipeUnit, ingredientUnit);
   if (converted === null) return null;
   
   return `${recipeQty} ${recipeUnit} = ${formatQuantity(converted, ingredientUnit)} ${ingredientUnit}`;
 }