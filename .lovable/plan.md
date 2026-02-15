

# AI-Powered Food Safety: Smart Temp Logs and Receiving

## Overview

Transform the Food Safety module into an intuitive, AI-assisted system where chefs can log temperatures and receiving checks via three methods: manual input, snap a photo of a thermometer display, or snap a photo of a delivery invoice. AI reads the values automatically and flags danger-zone issues.

## What Changes

### 1. Smart Temperature Logging

Currently the temp log is a basic text field. The upgrade adds:

- **Three input modes** on the temp log dialog:
  - **Manual**: Quick number pad-style input with unit toggle (C/F)
  - **Snap Temp Display**: Take a photo of the thermometer/probe screen -- AI reads the value and auto-fills
  - **Batch Entry**: Log multiple locations at once (Walk-in, Freezer, Hot Hold, etc.) in a grid

- **Auto-status detection**: When a temperature is entered (manually or via AI), the system automatically sets pass/warning/fail based on food safety zones:
  - Fridge: 0-5C = pass, 5-8C = warning, 8+ = fail
  - Freezer: below -18C = pass, -18 to -15C = warning, above -15C = fail
  - Hot hold: 63C+ = pass, 60-63C = warning, below 60C = fail
  - Configurable per location

- **Danger zone alerts**: Visual indicator showing where the reading falls relative to safe ranges

### 2. Smart Receiving Logs

Currently just a basic log entry. The upgrade adds:

- **Three input modes** on the receiving dialog:
  - **Manual**: Enter supplier, items, temps, condition
  - **Snap Invoice/Delivery Note**: Photo of the delivery paperwork -- AI extracts supplier name, items, quantities
  - **Snap Temp**: Photo of the probe reading on delivered goods

- **Receiving checklist** built into the form:
  - Packaging intact?
  - Temperature within range?
  - Best-before dates OK?
  - Vehicle cleanliness?
  - Each item gets a pass/fail toggle

- **AI extraction**: When a delivery note photo is snapped, AI reads the supplier name, item list, and populates the form. Chef just confirms temps and condition.

### 3. New Edge Function: `read-temp-display`

A new backend function that accepts a photo of a thermometer display and returns the temperature reading:

- Uses Gemini Flash vision model
- Returns: `{ temperature: number, unit: "C" | "F", confidence: number }`
- Handles digital displays, probe screens, and dial thermometers

### 4. Improved Logs UI

- **Today's summary** at the top of the Logs tab: how many checks done today vs target (e.g., "4 of 8 temp checks completed")
- **Timeline view**: Logs shown in a timeline by time-of-day, grouped by type
- **Quick-log buttons**: One-tap buttons for common checks (Walk-in, Freezer, Hot Hold) that pre-fill location

## Technical Details

### New Edge Function

**`supabase/functions/read-temp-display/index.ts`**

Accepts a base64 image, uses Gemini Flash to read the temperature from the display, returns structured data. Uses tool calling to ensure clean JSON output.

### Database Changes

Add columns to `food_safety_logs` for richer receiving data:

```sql
ALTER TABLE food_safety_logs ADD COLUMN IF NOT EXISTS 
  receiving_data jsonb DEFAULT NULL;
-- Structure: { supplier, items: [{name, qty, temp, condition}], vehicle_clean, packaging_ok }

ALTER TABLE food_safety_logs ADD COLUMN IF NOT EXISTS 
  temp_image_url text DEFAULT NULL;
-- Photo of thermometer display used for AI reading
```

### Modified Files

- **`src/pages/FoodSafety.tsx`** -- Major rework of the log dialog to support the three input modes (manual / snap temp / snap invoice). Add quick-log buttons, today's summary stats, auto-status detection based on temperature zones. Improve receiving tab with structured checklist. Add photo capture for temp displays with AI reading.

### New Files

- **`supabase/functions/read-temp-display/index.ts`** -- Edge function that reads temperature from a photo of a thermometer display using AI vision

### Flow: Temperature Check

1. Chef taps "Quick Check" or "New Log"
2. Chooses location (Walk-in, Freezer, etc.) or types custom
3. Either:
   - Types temperature manually (number pad style)
   - Taps camera icon, snaps photo of probe/display
   - AI reads the temp and fills the field
4. System auto-detects pass/warning/fail based on location type
5. If warning or fail, prompts for corrective action
6. Saved with timestamp, user, and optional photo evidence

### Flow: Receiving Check

1. Chef taps "Log Delivery" on receiving tab
2. Either:
   - Snaps photo of delivery note -- AI extracts supplier + items
   - Manually enters supplier and items
3. For each item, chef checks: temp OK, packaging OK, dates OK
4. Snaps probe temp photo or enters manually for cold items
5. Overall pass/fail with notes
6. Saved as receiving log with structured `receiving_data`

### Temperature Zone Config

Stored in the `readings` JSONB field with the location type. Default zones:

| Location Type | Pass | Warning | Fail |
|--------------|------|---------|------|
| Fridge | 0-5C | 5-8C | 8C+ |
| Freezer | -18C or below | -18 to -15C | -15C+ |
| Hot Hold | 63C+ | 60-63C | below 60C |
| Ambient | 15-25C | 25-30C | 30C+ |
| Delivery Cold | 0-5C | 5-8C | 8C+ |
| Delivery Frozen | -18C or below | -15C+ | -12C+ |

