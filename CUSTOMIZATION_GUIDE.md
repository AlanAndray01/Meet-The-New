# Quick Reference - Bubble Customization Guide

## How to Further Customize the Bubbles

### Change Bubble Color
Edit line 167 in `src/components/HeroSection.tsx`:
```typescript
color: '#f5a9d0',  // Change this hex color
```

Example colors:
- Purple: `#b19cd9`
- Blue: `#87ceeb`
- Gold: `#ffd700`
- Green: `#90ee90`
- Orange: `#ffa500`

### Change Bubble Glossiness
Edit line 170 in `src/components/HeroSection.tsx`:
```typescript
shininess: 100,  // Higher = shinier (0-100)
```

- 10-30: Matte plastic look
- 50-70: Satin finish
- 80-100: Shiny, polished look

### Adjust Lighting Intensity

#### Make Bubbles Brighter
```typescript
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);  // Increase from 0.8
const spotLight = new THREE.SpotLight(0xffffff, 1.5);       // Increase from 1.2
```

#### Make Bubbles Darker
```typescript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);  // Decrease from 0.8
const spotLight = new THREE.SpotLight(0xffffff, 0.9);       // Decrease from 1.2
```

### Move the Main Light Source
Edit spotLight position (line 196):
```typescript
spotLight.position.set(20, 30, 25);  // (x, y, z)
```

- Move right: Increase x
- Move up: Increase y
- Move forward: Increase z

### Change Point Light Color
Edit line 201:
```typescript
const pointLight = new THREE.PointLight(0xffb3d9, 0.8);  // Change the hex color
```

This creates a color-tinted ambient light.

## Performance Tips

- **Reduce Bubble Quality**: Change geometry segments
  ```typescript
  const geometry = new THREE.SphereGeometry(radius, 32, 32);  // Lower from 64
  ```
  (Lower values = faster rendering)

- **Reduce Shadow Quality**: 
  ```typescript
  renderer.shadowMap.type = THREE.BasicShadowMap;  // Faster than PCFSoftShadowMap
  ```

## Current Settings Summary

```
Material: MeshPhongMaterial
Color: #f5a9d0 (Soft Pink)
Emissive: #ff9ec0 (Glow)
Shininess: 100 (Very Shiny)

Lights:
- Ambient: 0xffffff @ 0.8
- Spot: 0xffffff @ 1.2 (main light)
- Point: 0xffb3d9 @ 0.8 (warm pink light)
- Directional: 0xffffff @ 0.4
```

## Need More Advanced Control?

Install and uncomment dat.GUI for real-time controls:
1. Uncomment GUI code in HeroSection.tsx
2. Open browser dev tools
3. Adjust all lighting and material in real-time
4. See changes instantly!

---

**File to Edit**: `src/components/HeroSection.tsx`
**Save & Refresh**: Changes appear instantly in dev server
