# Circle of Good Standing - Development Progress

## Session: January 18, 2026 (Continued)

### Letter Page Splitting Fix (Completed)
- **Problem**: Long letters without paragraph breaks weren't splitting correctly
  - Text was cutting off mid-page with content lost between pages
  - First line would appear alone on page 1, rest crammed into page 2
- **Solution**: Rewrote `splitIntoPages()` with sentence-based splitting
  - New `splitAtSentences()` function finds natural break points (., !, ?)
  - Falls back to word boundaries if no sentence break found
  - `MAX_CHARS_PER_PAGE` tuned to 700 characters (tested: 500, 600, 800, 950)
- **Page Indicator**: Made more compact - just "1 / 4" with minimal spacing, no border

### Phone/Playlist Audio Fix (Completed)
- **Problem**: Some songs wouldn't play when clicking the play button
  - Spotify preview URLs expire after days/weeks
  - No error handling, so failed plays did nothing
- **Solution**: Added graceful degradation for expired previews
  - Track failed previews in `failedPreviews` state (Set)
  - When audio fails to load/play, mark that song as failed
  - Failed songs show Spotify icon instead of play button
  - Clicking failed songs opens Spotify directly
  - Working previews continue to play inline as before

### Files Modified This Session
- `src/components/letter/Letter.tsx` - New sentence-based page splitting, compact page indicator
- `src/components/decorations/Phone.tsx` - Audio error handling, failed preview tracking

---

## Session: January 17-18, 2026

### Letter System Overhaul

#### Multi-Page Letter Popup (Completed)
- Fixed letter popup to center on screen when expanded (like other popups)
- Implemented stacked pages visual with offset and rotation for depth effect
- Added click navigation: left side goes back, right side goes forward
- Pages cycle through (last page -> first page, first page -> last page)

#### Multiple Letters Feature (Completed)
- **New Data Model**: Added `LetterEntry` type with id, author, content, createdAt, title
- **Storage**: Updated `CircleInstance` to use `letters: LetterEntry[]` instead of single `letterContent`
- **Two-Panel Layout**:
  - Left panel: Letter list with "Write New Letter" button
  - Right panel: Stacked page reader for selected letter
- **New Letter Modal**: Title (optional) + content textarea
- **Author Selection**: Toggle between Julian and Mahnoor when writing
- **Both users can write**: Not restricted by edit/view mode

#### Letter Styling
- Changed from handwritten (Caveat) to typewriter font (Special Elite)
- Added Special Elite to Google Fonts import
- Adjusted text size and line height for typewriter aesthetic

#### Notification Badge
- Added red iMessage-style notification badge on envelope icon
- Shows count of letters
- Positioned at top-right of envelope (adjusted: top-8 right-10)

#### Page Splitting Logic Fix
- Fixed issue where short letters were incorrectly split across multiple pages
- New logic:
  - Explicit `---` creates page breaks
  - Letters under 1200 chars stay on one page
  - Only very long letters auto-split at paragraph breaks

### Files Modified This Session
- `src/types/index.ts` - Added LetterEntry type
- `src/lib/storage.ts` - Added addLetter function, updated createCircle
- `src/hooks/useCircle.ts` - Added addNewLetter with author parameter
- `src/components/letter/Letter.tsx` - Complete rewrite for multi-letter system
- `src/pages/CirclePage.tsx` - Wired up new letter props
- `src/index.css` - Added typewriter font variable and class
- `index.html` - Added Special Elite font import

### Git Repository
- Initialized git repository
- Initial commit: `c3100ad` with 61 files, 8,973 insertions

---

## Previous Work (Before This Session)

### Core Features
- Draggable table items with Framer Motion
- Expandable popups for each item
- Coaster with position tracking, zones, and history
- Birthday wishlist with checkable items
- Conditions list for "good standing"

### Decorations
- **Epok Popup**: Shows epok_cap and epok_bin side by side, click-drag to spawn snus pouches
- **Phone Popup**: Spotify playlist viewer with 27 songs, album art, 30-second previews, hover explanations
- **Ice Cream & Fries**: Click-drag fries to dip in ice cream

### Tech Stack
- React + TypeScript
- Vite for build/dev
- Framer Motion for animations
- Tailwind CSS for styling
- localStorage for data persistence

---

## Known Issues / Future Work
- **Spotify Preview URLs**: Some have expired - songs 1, 2, 5 and possibly others show Spotify icon and open Spotify instead of playing inline. To fix permanently, would need to fetch fresh preview URLs from Spotify API.

## Notes
- Edit mode = Mahnoor's link (can edit coaster position, birthday list, conditions)
- View mode = Julian's link (read-only for most items, but can write letters)
- Both modes can write and read letters
