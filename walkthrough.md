# Walkthrough: Interactive GIS Lab // 02 — Dam Hydraulics & Reservoir Routing

## Overview
Recent updates have refined **Interactive GIS Lab // 02** to reflect hydraulic engineering principles and responsive UX:

---

### 1. Key Hydraulic Engineering & UI Updates

1. **Spillway Weir Length ($L_{\text{savak}}$) Starts from 0**:
   - The slider for $L_{\text{savak}}$ now has `min = 0`.
   - When $L_{\text{savak}} = 0$, the dam acts as a **non-overflow structure / dry detention dam without a surface spillway**:
     - Spillway discharge $Q_{\text{savak}} = 0$.
     - The Profile and Downstream Elevation diagrams dynamically remove the weir notch and downstream chute, rendering a solid concrete monolith and displaying `(Dolu Savaksız Gövde - L=0)`.
     - Water is routed solely through the bottom outlet orifice until crest elevation $H_{\text{kret}}$ is exceeded, triggering emergency crest overtopping across the full crest length $L_{\text{kret}}$.

2. **Replaced Constant Pool Area with Realistic Maximum Storage Capacity ($S_{\text{maks}}$)**:
   - Rather than assuming an unrealistic constant rectangular lake area, the level-pool routing engine now implements a parabolic V-valley stage-storage curve:
     $$S(h) = S_{\text{maks}} \cdot \left[ 0.2 \left(\frac{h}{H}\right) + 0.8 \left(\frac{h}{H}\right)^2 \right]$$
     $$A(h) = \frac{dS}{dh} = \frac{S_{\text{maks}}}{H} \cdot \left[ 0.2 + 1.6 \left(\frac{h}{H}\right) \right]$$
   - Default value is set to **$15.0\text{ hm}^3$** ($15\text{ million m}^3$).
   - Users can adjust the capacity using **both a slider and a direct number input box** (`<input type="number">`).

3. **Dual Y-Axis Hydrograph**:
   - **Left Y-Axis**: Flow discharge $Q$ ($\text{m}^3/\text{s}$) for Inflow and Outflow hydrographs.
   - **Right Y-Axis**: Reservoir water level / stage $h$ ($\text{m}$) plotted in purple, alongside dashed reference lines for Spillway Crest ($H_{\text{savak}}$) and Dam Crest ($H_{\text{kret}}$).

4. **Side-by-Side Lab 01 Workbench Layout**:
   - Dam visualization (Left) and Routing Hydrograph (Right) sit side-by-side on desktop.
   - Parameter controls are arranged in a clean, compact grid **underneath** the workbench.
   - Switchable between **📐 Enkesit (Profil)** and **🏛️ Boykesit (Ön Görünüş)**.
   - Text labels on the dam diagram have no background pills; instead, clean text halos (`paintOrder="stroke fill"`) ensure readability without obscuring drawing elements or colliding.

5. **No Thesis / Academic References & Formatted Equations**:
   - Removed all personal thesis / M.Sc. references across the site.
   - Governing equations drawer presents proper mathematical notation for piecewise rating curves ($Q_1$ through $Q_4$), stage-storage curves, and RK4 continuity mass conservation.

---

## Verification & Deployment
- Next.js production build (`npm run build`) succeeded with 0 errors across all routes.
- Changes committed and pushed to `feature/playground-hero` on GitHub (`d48c1a0`).
