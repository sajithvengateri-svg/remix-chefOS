
## Fix: Admin Dashboard Heatmap Not Loading

### Problem
The `AdminHeatmap` component on the Admin Dashboard (`/admin`) crashes with a `react-leaflet` v5 + React 18 incompatibility error ("r is not a function").

### Solution
Downgrade `react-leaflet` from v5 to v4.2.1 (the last version supporting React 18).

### Steps

1. **Update `package.json` dependencies**:
   - Change `react-leaflet` from `^5.0.0` to `4.2.1`
   - Add `@react-leaflet/core` at `2.1.0` (required peer dependency for v4)
   - `leaflet` stays at `^1.9.4` (already compatible)

2. **No component code changes needed** -- the `AdminHeatmap` component uses `MapContainer`, `TileLayer`, `CircleMarker`, `Popup`, and `useMap`, all of which have the same API in v4.

### Technical Details
- `react-leaflet` v5 uses React 19 internals. When bundled with React 18, the shared hook dispatcher breaks, causing the minified "r is not a function" runtime error.
- v4.2.1 is the last stable release targeting React 18.
- The `@react-leaflet/core` package is a peer dependency that v4 requires explicitly.
