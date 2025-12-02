# VisionOS Glass Design System Guide

## 1. Moodboard
- Glass morphism
- Semi-transparent blur surfaces
- 3D reflective orbs
- Soft lighting with bloom
- Depth-based Z-layer UI
- Calm, futuristic, minimal

## 2. Color System
### Background
- Gradient: #0f121a → #1b1f2a → #0c0f18
- Soft aurora highlight: #b7d7ff, #c4f2ff

### Glass Surfaces
- Base: rgba(255, 255, 255, 0.10)
- Hover: rgba(255, 255, 255, 0.14)
- Border: rgba(255, 255, 255, 0.23) 1px
- Glow: rgba(150, 180, 255, 0.25)

## 3. Layout Rules
- Use 3 depth layers:
  - Z-1: Background gradients, shader layers
  - Z-2: 3D elements (R3F)
  - Z-3: Text and UI components
- Avoid standard card grids; aim for curved, floating sections
- Generous spacing (48–80px)

## 4. Typography
- Heading: SF Pro Display, 60–96px
- Subheading: Inter 28–32px
- Body: Inter 18–20px
- Weight: Light → Regular → Medium only
- Letter spacing: -1% to -2% for display titles

## 5. Components
### Glass Panel
- backdrop-filter: blur(24px) saturate(180%)
- background: rgba(255,255,255,0.10)
- border-radius: 24px
- border: 1px solid rgba(255,255,255,0.23)
- box-shadow:
  0 0 40px rgba(150,180,255,0.18),
  inset 0 0 30px rgba(255,255,255,0.1)

### Floating Motion
- animation: float 6s ease-in-out infinite

### Buttons
- Capsule-shaped (full-rounded)
- Glass base + white border + soft glow on hover

## 6. Interaction Rules
- Soft parallax motion on mousemove
- Scroll-triggered section fade transitions
- 3D objects react slightly to scroll depth

## 7. Hero Section Template
- Large reflective glass orb(s) in background
- Main title inside glass panel
- CTA button: glass capsule
- Depth parallax: 3 layers

## 8. Prohibited
- Default Tailwind shadows
- Typical grid-shaped feature cards
- Sharp edges; always use rounded geometry
- Flat solid color panels
