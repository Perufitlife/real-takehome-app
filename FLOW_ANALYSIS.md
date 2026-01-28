# Flow Analysis - Current vs Target

## PROBLEMA IDENTIFICADO

### Current Flow (MALO):
```
Onboarding (Input) → Results (Output) → Paywall → Stuck/Bye
```

**Issues:**
- Paywall demasiado temprano
- No muestra valor antes de pedir dinero
- No hay curiosity → satisfaction → pain loop
- Usuarios no entienden por qué pagar
- No retention hooks

### Target Flow (BUENO):
```
Input → Output → Compare (FREE) → Optimize (TEASER) → Paywall → Full Tools
```

**Why Better:**
- Dopamine first (see results)
- Curiosity (comparison cards)
- Value demonstration (free previews)
- THEN ask for money
- Clear ROI

---

## ARCHITECTURAL CHANGES NEEDED

### 1. Onboarding Simplification
- Keep 7 screens as-is (already optimized)
- Add country detection (global support)
- Make state/filing conditional on USA

### 2. Results Screen Restructure
- **Monthly FIRST** (not bi-weekly)
- Then Annual
- Then weekly/bi-weekly/hourly smaller
- Monthly is universal, bi-weekly is USA-specific

### 3. NEW: Hook Cards Section
**After results, before paywall:**
- 3 preview cards:
  - "Work extra hours?" → Overtime preview
  - "Compare job offers" → Job comparison teaser
  - "Move states?" → State comparison teaser
- Tapping shows FREE preview (not full tool)

### 4. NEW: Tool Preview Screens
- Show VALUE before paywall
- Example: "+5 hours = +$135/week" (visible)
- "+10 hours = +$270/week" (visible)
- "+15 hours = locked 🔒" → Paywall

### 5. Paywall Repositioned
- Comes AFTER seeing value
- User understands ROI
- "Unlock unlimited" not "Get access"

### 6. Dashboard = Full App
- Only after premium unlock
- All tools available
- Settings, saved comparisons, etc.

---

## FILES THAT NEED CHANGES

### HIGH PRIORITY (Flow-breaking):
1. `app/index.tsx` - Routing logic
2. `app/(onboarding)/filing.tsx` - Where to go after onboarding
3. `app/results.tsx` - Monthly first, add hook cards
4. NEW: `app/hooks.tsx` - Hook cards screen
5. NEW: `app/tool-preview.tsx` - Free tool previews
6. `app/paywall.tsx` - Positioned after value demo
7. `app/(tabs)/index.tsx` - Dashboard after unlock

### MEDIUM PRIORITY (Enhancement):
8. Add global support (country detection)
9. Conditional USA flow (state/filing)
10. Monthly-first display logic

---

## QUESTIONS FOR YOU

Before I create the full plan, I need clarification:

1. **Onboarding destination:**
   - Current: filing → /(tabs)
   - Should it go to: filing → /results → /hooks → paywall → /(tabs)?

2. **Results screen:**
   - Should it be PART of onboarding (after filing)?
   - Or separate screen after onboarding?

3. **Hook cards:**
   - Are they a separate screen after results?
   - Or part of results screen?

4. **Free previews:**
   - Should overtime/job/state tools show 1-2 results free?
   - Then lock rest with paywall?

5. **First-time vs Returning:**
   - First time: Onboarding → Results → Hooks → Paywall → Dashboard
   - Returning: Direct to Dashboard?
   - Or always show results first?

Let me know and I'll create the perfect surgical plan.
