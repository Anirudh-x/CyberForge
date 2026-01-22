# Solution Button Visual Guide

## Feature Location

```
┌────────────────────────────────────────────────────────────┐
│  LAB HEADER                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Machine Name: Web Security Lab                       │  │
│  │  Vulnerabilities: SQL Injection, XSS, CSRF           │  │
│  │  Progress: 1/3 Captured                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  HELP SECTION (NEW!)                                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  [💡 NEED HELP? VIEW SOLUTION WALKTHROUGH]          ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  Stuck? Click above to view detailed solutions...          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  LAB WORKSPACE                                              │
│  ┌──────┬──────┬──────┬──────┐                            │
│  │  🌐  │  💻  │  📁  │  🚩  │  ← Tabs                    │
│  └──────┴──────┴──────┴──────┘                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  [Machine Interface / Browser / Terminal / Flags]   │  │
│  │                                                       │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Button States

### Default State (Help Hidden)
```
╔══════════════════════════════════════════════════════╗
║  [💡 NEED HELP? VIEW SOLUTION WALKTHROUGH]          ║
╚══════════════════════════════════════════════════════╝
Stuck? Click above to view detailed solutions and hints.
```

### Active State (Solutions Visible)
```
╔══════════════════════════════════════════════════════╗
║  [🔼 HIDE WALKTHROUGH]                               ║
╚══════════════════════════════════════════════════════╝
Solutions are displayed above. Review the steps and try!
```

## Solutions Section (When Opened)

### Unsolved Vulnerability Card
```
┌────────────────────────────────────────────────────────────┐
│  🔓 SQL Injection                               65 points   │
├────────────────────────────────────────────────────────────┤
│  🎯 Objective                                               │
│  Exploit SQL injection vulnerability to bypass auth...     │
│                                                             │
│  🔍 Steps to Solve                                         │
│  1. Identify input fields that interact with database      │
│  2. Test for SQL injection using payloads like ' OR 1=1    │
│  3. Bypass authentication or extract data using UNION      │
│  4. Locate the flag in database tables                     │
│                                                             │
│  💡 Key Concepts                                           │
│  • SQL syntax and query structure                          │
│  • Input validation bypass                                 │
│  • Database enumeration                                    │
│                                                             │
│  💡 Hint                                                   │
│  Use the steps above to find and capture the flag.        │
│  The flag will be revealed here once you solve this.      │
└────────────────────────────────────────────────────────────┘
```

### Solved Vulnerability Card
```
┌────────────────────────────────────────────────────────────┐
│  ✓ XSS                                    65 points  ✅ COMPLETED │
├────────────────────────────────────────────────────────────┤
│  🎯 Objective                                               │
│  Inject malicious JavaScript code that executes in...      │
│                                                             │
│  🔍 Steps to Solve                                         │
│  1. Identify input fields that reflect user input          │
│  2. Test basic XSS payloads like <script>alert('XSS')      │
│  3. Try alternative payloads if basic ones are filtered    │
│  4. Capture the flag from the response                     │
│                                                             │
│  💡 Key Concepts                                           │
│  • HTML/JavaScript injection                               │
│  • DOM manipulation                                        │
│  • Content-Security-Policy bypass                          │
│                                                             │
│  🚩 Flag                                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  FLAG{XSS_VULN3RABILITY_D3T3CT3D}                  │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Color Coding

### Help Button
- Background: Green gradient (#00ff00 → #00cc00)
- Text: Black (#000)
- Hover: Brighter green with shadow glow
- Border: Green (#00ff00)

### Unsolved Cards
- Border: Grey (#666)
- Background: Very light grey (rgba(255,255,255,0.03))
- Title: Grey (#999)
- Body text: Green (#00cc00)
- Hint box: Yellow border with dashed style

### Solved Cards
- Border: Bright green (#00ff00)
- Background: Light green tint (rgba(0,255,0,0.08))
- Title: Green (#00ff00)
- Body text: Green (#00cc00)
- Badge: "COMPLETED" in green

### Flag Display
- Background: Black (#000)
- Border: Green (#00ff00)
- Text: Monospace green (#00ff00)

## Interaction Flow

```
User Opens Lab
      ↓
Sees Help Button (Always visible)
      ↓
      ├── Continue working → Try to solve
      │         ↓
      │    Get stuck?
      │         ↓
      └── Click "Need Help?" Button
            ↓
      Solutions expand above
            ↓
      ├── View unsolved vulns (hints only)
      └── View solved vulns (with flags)
            ↓
      Learn from steps and concepts
            ↓
      Click "Hide Walkthrough"
            ↓
      Return to solving
```

## Responsive Behavior

### Desktop (>1400px)
- Full width layout
- Cards displayed in single column
- Large, prominent button

### Tablet (768px - 1400px)
- Constrained to max-width: 1400px
- Cards remain single column
- Button adjusts padding

### Mobile (<768px)
- Stack elements vertically
- Button becomes full-width
- Cards maintain readability

## Accessibility Features

- **Keyboard Navigation**: Button fully keyboard accessible
- **Screen Readers**: Descriptive button text and ARIA labels
- **Color Contrast**: High contrast green on black
- **Focus Indicators**: Clear focus states on interactive elements
- **Semantic HTML**: Proper heading hierarchy

## Animation Details

### Button Hover
```
Normal → Hover
- Transform: translateY(0) → translateY(-2px)
- Shadow: 0 4px 15px → 0 6px 25px
- Duration: 0.3s ease
```

### Card Expansion
```
Hidden → Visible
- Opacity: 0 → 1
- Max-height: 0 → auto
- Duration: 0.4s ease
```

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **Load Impact**: Minimal (solutions loaded with page)
- **Render Time**: <50ms for button click
- **Memory**: ~2KB additional per vulnerability
- **No API calls**: All data client-side
