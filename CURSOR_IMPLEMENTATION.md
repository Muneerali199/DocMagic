# Trailing Cursor Implementation

A modern, smooth trailing cursor effect that enhances user experience with elegant visual feedback and interactivity.

## 🌟 Features

### Core Functionality
- **Dot Cursor**: Small, solid dot that immediately tracks the user's exact cursor position
- **Trailing Circle**: Larger, semi-transparent circle that follows with smooth interpolation
- **Interactive Hover States**: Dynamic scaling and color changes when hovering over interactive elements
- **Performance Optimized**: Lightweight JavaScript with efficient animations
- **Mobile Responsive**: Automatically disables on mobile and touch devices
- **Accessibility Compliant**: Respects reduced motion preferences and maintains keyboard navigation

### Advanced Features
- **Color Customization**: Multiple color themes and presets
- **Real-time Controls**: Live settings panel for instant customization
- **Smart Detection**: Automatically detects interactive elements
- **Smooth Easing**: Cubic-bezier transitions for professional feel
- **Memory Efficient**: Optimized animation loops with smart frame skipping

## 🏗️ Architecture

### Component Structure
```
components/
├── cursor-provider.tsx          # Global cursor context and provider
├── cursor-settings.tsx          # Settings panel with live controls
├── ui/
│   ├── trailing-cursor.tsx      # Main cursor component
│   └── interactive.tsx          # Utility component for interactive elements
hooks/
└── use-trailing-cursor.ts       # Custom hook for cursor logic
types/
└── cursor.ts                    # TypeScript type definitions
```

### Key Components

#### 1. CursorProvider
- Manages global cursor state
- Provides context for cursor customization
- Handles user preferences (reduced motion)
- Wraps the entire application

#### 2. TrailingCursor
- Renders the dot and trail elements
- Handles position updates and animations
- Manages hover state detection
- Optimizes performance with RAF

#### 3. useTrailingCursor Hook
- Encapsulates cursor logic
- Manages event listeners
- Handles mobile detection
- Provides smooth animation loop

## 🎨 Customization

### Color Themes
The cursor supports multiple color themes:
- **Ocean Blue**: `rgb(59, 130, 246)` with `rgba(59, 130, 246, 0.3)` trail
- **Sunset Gold**: `rgb(245, 158, 11)` with `rgba(245, 158, 11, 0.3)` trail
- **Forest Green**: `rgb(16, 185, 129)` with `rgba(16, 185, 129, 0.3)` trail
- **Royal Purple**: `rgb(124, 58, 237)` with `rgba(124, 58, 237, 0.3)` trail
- **Rose Pink**: `rgb(244, 63, 94)` with `rgba(244, 63, 94, 0.3)` trail
- **Cyber Cyan**: `rgb(6, 182, 212)` with `rgba(6, 182, 212, 0.3)` trail

### Configuration Options
```typescript
interface CursorConfig {
  dotColor: string;        // Color of the dot cursor
  trailColor: string;      // Color of the trailing circle
  dotSize: number;         // Size of the dot (default: 8px)
  trailSize: number;       // Size of the trail (default: 32px)
  trailSpeed: number;      // Animation speed (default: 0.15)
  hoverScale: number;      // Scale factor on hover (default: 1.5)
  disabled: boolean;       // Enable/disable the effect
}
```

## 🚀 Performance Optimizations

### Animation Efficiency
- **RequestAnimationFrame**: Uses RAF for smooth 60fps animations
- **Smart Frame Skipping**: Only animates when there's significant movement
- **GPU Acceleration**: Uses `translate3d` and `backface-visibility: hidden`
- **Optimized Easing**: Efficient interpolation calculations

### Memory Management
- **Event Listener Cleanup**: Proper cleanup on component unmount
- **Animation Cancellation**: Cancels RAF when not needed
- **Passive Event Listeners**: Uses passive listeners for better performance

### Mobile Optimization
- **Touch Detection**: Multiple methods to detect touch devices
- **Screen Size Detection**: Disables on screens smaller than 768px
- **User Agent Detection**: Fallback detection for mobile browsers
- **Automatic Disable**: No performance impact on mobile devices

## ♿ Accessibility Features

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .cursor-dot,
  .cursor-trail {
    transition: none;
    animation: none;
  }
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  .cursor-dot {
    mix-blend-mode: normal;
    background-color: #000 !important;
  }
}
```

### Keyboard Navigation
- Enhanced focus styles with visible outlines
- Cursor doesn't interfere with keyboard navigation
- Screen reader compatibility maintained

## 🎯 Interactive Elements

### Automatic Detection
The cursor automatically detects and responds to:
- `<a>` links
- `<button>` elements
- `<input>`, `<textarea>`, `<select>` form elements
- Elements with `role="button"`
- Elements with `tabindex` attribute
- Elements with `.cursor-pointer` class
- Elements with `[data-interactive]` attribute

### Custom Interactive Elements
```tsx
import { Interactive } from "@/components/ui/interactive";

<Interactive
  as="div"
  cursorScale={1.3}
  cursorColor="purple"
  className="my-interactive-element"
>
  Custom interactive content
</Interactive>
```

## 🛠️ Implementation Details

### CSS Optimizations
- **Mix Blend Mode**: Uses `mix-blend-mode: difference` for the dot
- **Z-Index Management**: Proper layering with z-index 9998-9999
- **Pointer Events**: `pointer-events: none` to prevent interference
- **Will Change**: Optimizes for transform animations

### JavaScript Optimizations
- **Debounced Resize**: Efficient window resize handling
- **Memoized Callbacks**: Uses `useCallback` for stable references
- **Ref-based State**: Uses refs for high-frequency updates
- **Conditional Rendering**: Only renders when necessary

## 🔧 Usage Examples

### Basic Implementation
```tsx
import { CursorProvider } from "@/components/cursor-provider";

function App() {
  return (
    <CursorProvider>
      <YourAppContent />
    </CursorProvider>
  );
}
```

### Custom Configuration
```tsx
<CursorProvider
  defaultEnabled={true}
  defaultDotColor="rgb(245, 158, 11)"
  defaultTrailColor="rgba(245, 158, 11, 0.3)"
>
  <YourAppContent />
</CursorProvider>
```

### Settings Integration
```tsx
import { CursorSettings } from "@/components/cursor-settings";

function Layout() {
  return (
    <div>
      <YourContent />
      <CursorSettings />
    </div>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Cursor not appearing**
   - Check if device is mobile (automatically disabled)
   - Verify `CursorProvider` is wrapping your app
   - Check if reduced motion is enabled

2. **Performance issues**
   - Ensure proper cleanup of event listeners
   - Check for memory leaks in animation loops
   - Verify GPU acceleration is working

3. **Hover detection not working**
   - Add `data-interactive` attribute to custom elements
   - Check CSS pointer-events settings
   - Verify element is not covered by other elements

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG_CURSOR = process.env.NODE_ENV === 'development';
```

## 📱 Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Automatically disabled

## 🎉 Best Practices

1. **Use sparingly**: Don't overuse hover effects
2. **Test on mobile**: Ensure graceful degradation
3. **Consider accessibility**: Always provide alternatives
4. **Monitor performance**: Check frame rates on lower-end devices
5. **Customize thoughtfully**: Choose colors that complement your design

## 📄 License

This implementation is part of the DocMagic project and follows the same licensing terms.