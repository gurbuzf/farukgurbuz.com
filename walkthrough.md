# Walkthrough: Interactive GIS Lab // 02 — Dam Hydraulics & Reservoir Routing

## Overview
Recent updates have refined **Interactive GIS Lab // 02** to reflect hydraulic engineering principles and responsive UX:

---

### 1. Key Hydraulic Engineering & UI Updates

1. **Legit Mathematical Equations Typesetting (LaTeX-grade)**:
   - Replaced raw monospace ASCII text strings with authentic academic mathematical typesetting.
   - Built custom mathematical layout primitives (`MathFrac`, `MathSqrt`) using serif math typography (`STIX Two Math`, `Cambria Math`, `serif`).
   - Formatted all fractions with true horizontal fraction bars:
     $$\frac{dS}{dt} = I(t) - Q(t, h) \iff \frac{dh}{dt} = \frac{I(t) - Q(t, h)}{A(h)}$$
   - Rendered true square roots with radical signs and overhead vinculum bars ($\sqrt{2gh}$), proper fractions in exponents ($^{\frac{3}{2}}$), and subscript variables ($Q_1(h)$, $A_{\text{ıslak}}$, $H_{\text{savak}}$, $H_{\text{kret}}$).
   - Structured the 4 discrete outflow regimes using an authentic large piecewise curly brace system ($Q(t, h) = \begin{cases} \dots \end{cases}$).
   - Added complete 4th-Order Runge-Kutta (RK4) integration formula and parabolic hypsometry stage-storage equations.

2. **Simplified & Cleaner Workbench Layout**:
   - Removed the redundant 4-metric banner (`Safety Freeboard`, `Peak Attenuation`, `Peak Delay Lag`, `Peak Water Stage`) that sat above the dam and hydrograph.
   - The interactive dam visualization (Left) and dual-axis hydrograph (Right) now appear immediately below the scenario presets toolbar without visual clutter.

3. **Outlet Orifice Diameter ($d$) Can Be 0 ($d = 0$)**:
   - The slider allows `min = 0` (range 0 to 2.8 m).
   - When $d = 0$, the structure represents a **dam or weir without a low-level bottom outlet**:
     - Orifice discharge $Q_{\text{orifice}} = 0$.
     - Both Enkesit (Profile) and Boykesit (Elevation) dynamically omit the conduit pipe, circular orifice opening, and pressurized outlet jet.
     - Flow regimes update to "Hazne Depolaması (Dip Savaksız)" during low stages.

4. **Lower Limits for Crest and Spillway Heights**:
   - Dam Crest Height ($H_{\text{kret}}$ / $h_{\text{max}}$) lower limit reduced to **$2.0\text{ m}$** (supporting low-head detention weirs, check dams, and river barriers up to $35\text{ m}$ high dams).
   - Spillway Crest Height ($H_{\text{savak}}$ / $h_{\text{spill}}$) lower limit reduced to **$0.5\text{ m}$** with fine step ($0.2\text{ m}$).
   - Dynamic proportional scaling in SVG ensures small structures (2m-5m) are scaled cleanly and rendered just as legibly as 30m high concrete dams without clipping.

5. **Removed "Figure 2.2 Formulations" Badges**:
   - Removed all `Figure 2.2 Formulations` badge elements and comments from `hydrology-lab-section.tsx`, `app/lab/page.tsx`, and `dam-routing.ts`.

6. **Spillway Weir Length ($L_{\text{savak}}$) Starts from 0**:
   - When $L_{\text{savak}} = 0$, the dam acts as a non-overflow structure without a surface spillway ($Q_{\text{savak}} = 0$), rendering a continuous solid crest with no chute.

7. **Replaced Constant Pool Area with Realistic Maximum Storage Capacity ($S_{\text{maks}}$)**:
   - Parabolic V-valley stage-storage curve:
     $$S(h) = S_{\text{maks}} \cdot \left[ 0.2 \left(\frac{h}{H}\right) + 0.8 \left(\frac{h}{H}\right)^2 \right]$$
     $$A(h) = \frac{dS}{dh} = \frac{S_{\text{maks}}}{H} \cdot \left[ 0.2 + 1.6 \left(\frac{h}{H}\right) \right]$$
   - Default value is **$15.0\text{ hm}^3$**, adjustable via both slider and direct number input box.

8. **Dual Y-Axis Hydrograph**:
   - Left Y-Axis: Flow discharge $Q$ ($\text{m}^3/\text{s}$).
   - Right Y-Axis: Water level stage $h$ ($\text{m}$) with $H_{\text{savak}}$ and $H_{\text{kret}}$ reference guides.

---

## Verification & Deployment
- Next.js production build (`npm run build`) succeeded with 0 errors across all routes.
- Changes committed and pushed to `feature/playground-hero` on GitHub (`6c786e2`).
