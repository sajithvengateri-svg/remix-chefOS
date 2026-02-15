

# Invoice Archiving, Equipment Inventory, and Cleaning Materials Tracking

## Overview

Three connected improvements to close gaps in the inventory and invoicing workflow:

1. **Invoice Archive** -- Every scanned invoice image/PDF gets stored permanently under the org, viewable from the Invoices page. Option to "save only" without AI extraction (for non-food invoices like plates, equipment).
2. **Equipment and Smallwares Inventory** -- A new tab under Inventory for tracking plates, cutlery, utensils, trays, pots, pans, etc. Separate from food cost but still flows to vendor intelligence.
3. **Cleaning Materials Inventory** -- Another tab under Inventory for chemicals, cloths, gloves, etc. Also excluded from food cost calculations.

---

## 1. Invoice Archive

### What changes
- **File Storage**: Upload the original invoice file to a new `invoices` storage bucket (org-scoped path: `{org_id}/{timestamp}_{filename}`)
- **Database**: Add `file_url` and `invoice_type` columns to `invoice_scans` table. `invoice_type` can be `food`, `equipment`, `cleaning`, `other`
- **Scanner Dialog**: Add a "Save Without Extracting" button alongside "Process Invoice". When used, it uploads the file and creates an `invoice_scans` record with status `archived` (no AI call)
- **Invoices Page**: Add tabs -- "Scan" and "Archive". Archive tab shows all stored invoices with type filter, date, file preview/download link
- **RecentScans**: Updated to show file download links and invoice type badges

### Invoice types
- Food (default, triggers AI extraction + ingredient matching)
- Equipment (save only, or extract to equipment inventory)
- Cleaning (save only, or extract to cleaning inventory)
- Other (save only)

---

## 2. Equipment and Smallwares Inventory Tab

### What changes
- **New table**: `equipment_inventory` with columns for item name, category (plates, cutlery, utensils, trays, glassware, pots/pans, other), quantity, unit (each/set/dozen), location, condition, par level, last counted date, notes, org_id
- **Categories**: Plates, Cutlery, Utensils, Trays, Glassware, Pots and Pans, Linen, Other
- **UI**: New "Smallwares" tab on the Inventory page with its own add/edit/count flow, category filters, and par-level alerts
- **Stocktake support**: Count feature specific to equipment (condition tracking: good/chipped/replace)
- **Vendor link**: `supplier` column so equipment purchases feed into vendor intelligence alongside food data

---

## 3. Cleaning Materials Inventory Tab

### What changes
- **New table**: `cleaning_inventory` with columns for item name, category (chemicals, disposables, cloths, PPE, other), quantity, unit, location, par level, supplier, cost per unit, SDS url (safety data sheet), org_id
- **Categories**: Chemicals, Disposables, Cloths/Sponges, PPE (gloves, aprons), Paper Products, Other
- **UI**: New "Cleaning" tab on the Inventory page with add/edit, par-level alerts, reorder tracking
- **Cost separation**: These items are tracked for operational cost but explicitly excluded from food cost calculations
- **Vendor link**: `supplier` column feeds vendor intelligence

---

## Technical Details

### Database Migration

```sql
-- 1. Update invoice_scans for archiving
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS invoice_type text NOT NULL DEFAULT 'food';
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS supplier_name text;
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS invoice_date date;
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS total_amount numeric;
ALTER TABLE invoice_scans ADD COLUMN IF NOT EXISTS notes text;

-- 2. Equipment inventory table
CREATE TABLE public.equipment_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'each',
  par_level integer DEFAULT 0,
  condition text DEFAULT 'good',
  location text DEFAULT 'Kitchen',
  supplier text,
  cost_per_unit numeric DEFAULT 0,
  last_counted date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE equipment_inventory ENABLE ROW LEVEL SECURITY;
-- RLS: org-scoped read + head_chef/edit permission write

-- 3. Cleaning inventory table
CREATE TABLE public.cleaning_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'each',
  par_level numeric DEFAULT 0,
  location text DEFAULT 'Storage',
  supplier text,
  cost_per_unit numeric DEFAULT 0,
  sds_url text,
  last_ordered date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE cleaning_inventory ENABLE ROW LEVEL SECURITY;
-- RLS: org-scoped read + head_chef/edit permission write
```

### Storage
- Create `invoices` storage bucket (private, org-scoped access via RLS)

### Files to Modify
- **`src/pages/Invoices.tsx`** -- Add "Archive" tab, "Save Without Extracting" flow, invoice type filter
- **`src/components/inventory/InvoiceScannerDialog.tsx`** -- Add file upload to storage, invoice type selector, "Save Only" button
- **`src/components/invoices/RecentScans.tsx`** -- Add download links, type badges, expand to full archive view
- **`src/pages/Inventory.tsx`** -- Add "Smallwares" and "Cleaning" tabs with their own CRUD interfaces

### Files to Create
- **`src/components/inventory/EquipmentInventoryTab.tsx`** -- Equipment CRUD table with category filters, condition tracking
- **`src/components/inventory/CleaningInventoryTab.tsx`** -- Cleaning materials CRUD table with category filters, SDS links
- **`src/components/invoices/InvoiceArchive.tsx`** -- Archive list with type filters, date range, download/preview

### Data Flow
- Food invoices: AI extract -> update ingredients/inventory -> food cost
- Equipment invoices: Archive only (or manual entry to equipment_inventory) -> vendor intelligence
- Cleaning invoices: Archive only (or manual entry to cleaning_inventory) -> vendor intelligence
- All invoice files: Stored permanently in `invoices` bucket, linked via `file_url` in `invoice_scans`
