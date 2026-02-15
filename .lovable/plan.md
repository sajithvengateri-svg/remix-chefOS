

# Recipes Section Overhaul: Photo-First New Recipe Flow

## Overview
Redesign the "New Recipe" experience so chefs can start from a thought bubble -- snap a photo of a handwritten recipe, napkin sketch, or even a cookbook page -- and have the system auto-extract everything into a structured recipe, ready for fine-tuning.

## Current State
- Clicking "+ New Recipe" creates a blank "Untitled Recipe" record and drops the chef into a full editor with empty fields
- The "Import Recipe" dialog (photo/file upload with AI extraction) exists but is buried behind a separate "Import" button
- These two paths are disconnected -- chefs must choose upfront whether to start blank or import

## New Flow: Unified "New Recipe" Launcher

Replace the current blank-record creation with a **choice screen** that appears when clicking "+ New Recipe":

```text
+-----------------------------------------------+
|          How do you want to start?             |
|                                                |
|  [Camera icon]     [Pencil icon]    [File icon]|
|  Snap a Photo      Start Blank     Import File |
|  "Handwritten       "I'll type      "PDF, Word |
|   notes, napkin      it in"          or image"  |
|   sketch, book"                                 |
|                                                |
|  -------- or paste a URL / text --------       |
|  [  Paste a recipe URL or raw text...    ]     |
+-----------------------------------------------+
```

### Path 1: Snap a Photo (camera capture)
1. Opens device camera directly (`capture="environment"`)
2. Shows live preview of captured image
3. "Extract Recipe" button sends to `extract-recipe` edge function
4. AI returns structured data -> auto-populates review screen
5. Chef reviews/tweaks -> saves -> lands in full editor with everything pre-filled

### Path 2: Start Blank
- Same as current behavior: creates placeholder record, opens editor with name auto-focused

### Path 3: Import File
- Same as existing RecipeImportDialog but embedded in the launcher flow

### Path 4: Paste URL/Text (new)
- Chef pastes a recipe URL or raw text
- Edge function extracts structured recipe from text content
- Same review -> save flow

## Detailed Implementation

### 1. New Component: `RecipeCreationLauncher.tsx`
A full-screen or large dialog component that replaces the direct navigation to `/recipes/new`. It will:
- Show the 3 creation paths as large, tappable cards (mobile-friendly)
- Include a text input for paste-a-URL flow
- Handle camera capture, file upload, and text extraction
- Show a processing animation while AI extracts
- Present a review screen with all extracted fields editable
- On save, create the recipe record + recipe_ingredients in one go, then navigate to `/recipes/{id}/edit`

### 2. Enhanced `extract-recipe` Edge Function
Update to also accept `text` input (not just files):
- Add support for `content-type: application/json` with `{ text: "..." }` body
- When text is provided, skip the vision model and use text-based extraction
- Return the same structured recipe format

### 3. Review Screen Improvements
The review screen (already exists in RecipeImportDialog) will be enhanced:
- Confidence indicators next to each extracted field (high/medium/low)
- Ingredient matching highlights: green = matched to database, yellow = similar match found, red = new ingredient
- One-click "Add to ingredient database" for unmatched ingredients
- Allergen auto-detection badges
- Estimated cost preview before saving

### 4. Route Changes
- `/recipes/new` will render `RecipeCreationLauncher` instead of immediately creating a blank record
- After save from any path, navigate to `/recipes/{id}/edit` for further editing

### 5. Mobile UX Priorities
- Camera button is the largest, most prominent option (chefs will use this most)
- Single-hand-friendly layout
- Haptic-like visual feedback on capture
- Processing screen shows animated chef hat with progress messages

## Technical Details

### Files to Create
- `src/components/recipes/RecipeCreationLauncher.tsx` -- main launcher component with all creation paths, camera capture, review screen, and save logic

### Files to Modify
- `src/pages/Recipes.tsx` -- change "+ New Recipe" button to open the launcher dialog instead of navigating to `/recipes/new`
- `src/pages/RecipeEdit.tsx` -- remove the `createNewRecipe` logic for `/recipes/new` route; that path now goes through the launcher
- `src/App.tsx` -- update `/recipes/new` route to use the launcher page or keep it pointing to RecipeEdit (which will handle both new-from-launcher and edit-existing)
- `supabase/functions/extract-recipe/index.ts` -- add JSON body support for text/URL-based extraction alongside the existing FormData/image flow

### Database
No schema changes needed. The existing `recipes` and `recipe_ingredients` tables already support everything.

### Edge Function Enhancement
The `extract-recipe` function will be updated to:
1. Check `Content-Type` header
2. If `application/json`: extract `{ text }` or `{ url }` from body, use text-based AI prompt
3. If `multipart/form-data`: existing image/file flow (unchanged)
4. Both paths return the same `ExtractedRecipe` JSON structure

