

# Kitchen Wall: Time-Based Delete Permissions

## What Changes

Currently, only the post author sees the delete button (three-dot menu). We need to update this so:

- **Anyone** can delete their own post **within 5 minutes** of posting
- **After 5 minutes**, only **Head Chefs / Owners / Admins** can delete any post
- The delete button shows contextual text: "Delete" within the window, "Delete (Admin)" for head chefs on older posts

## Implementation

### 1. Update TeamFeed.tsx -- Delete Visibility Logic

Replace the simple `isOwnPost` check with a function that determines delete eligibility:

```
canDeletePost(post):
  - If user is head chef/owner -> always true
  - If post is user's own AND posted less than 5 minutes ago -> true
  - Otherwise -> false
```

Import `isHeadChef` from `useAuth()` and use it alongside a time check using `differenceInMinutes` from date-fns (already imported).

The three-dot menu with the Delete option will appear for anyone who passes this check, not just the post owner.

### 2. Database: Add RLS Policy for Time-Based Delete

Add a new RLS policy that allows any authenticated user to delete posts within 5 minutes. This complements the existing "Users can delete their own posts" policy:

- Keep existing policy: own posts can always be deleted (we'll restrict via UI)
- The existing "Head chefs can manage all posts" FOR ALL policy already covers admin deletion

No new RLS migration needed -- the existing policies already allow:
- Users deleting their own posts (any time via RLS, but UI restricts to 5 min)
- Head chefs deleting any post

### Files Modified
- `src/components/feed/TeamFeed.tsx` -- Update delete button visibility logic to use time-based + role-based check

### No Database Changes Required
The existing RLS policies already support the needed access patterns. The 5-minute restriction is enforced at the UI level as a UX guardrail (the user technically "owns" the post, so RLS allows deletion).

