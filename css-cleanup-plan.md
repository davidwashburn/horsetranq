# CSS Cleanup Plan for style.css

## High Impact Cleanup (Immediate)

### 1. Remove Outdated Vendor Prefixes
**Lines affected**: 166-167, 176-177, 222-223, 230-231, 612-613, 617-618, 642-645, 647, 665

**Current:**
```css
-webkit-box-sizing: border-box;
-moz-box-sizing: border-box;
box-sizing: border-box;
```

**Replace with:**
```css
box-sizing: border-box;
```

**Impact**: Reduces file size by ~15-20 lines, improves maintainability

### 2. Consolidate Margin Utilities
**Lines affected**: 7, 11, 15, 19, 24, 29, 33-34

**Current:**
```css
h1 { margin: var(--space-xs); }
h2 { margin: var(--space-xs); }
h3 { margin: var(--space-xs); }
h4 { margin: var(--space-xs); }
p { margin: var(--space-xs); }
.margin-xs { margin: var(--space-xs); }
```

**Replace with:**
```css
h1, h2, h3, h4, p, .margin-xs { margin: var(--space-xs); }
```

**Impact**: Reduces redundancy by 80%, easier to maintain

### 3. Replace Hard-coded Colors with CSS Variables
**Lines affected**: 184, 195, 328, 332, 344, 687, 711, 1384, 1389, 1803, 1808, 1810, 1813, 1919

**Examples:**
```css
/* Current */
color: #64798f!important;
background-color: #d5dce5;

/* Replace with */
color: var(--color-contrast-medium);
background-color: var(--color-bg-light);
```

**Impact**: Better theme consistency, easier color management

### 4. Consolidate Media Queries
**Lines affected**: 487, 1225, 2705

**Current:** 3 separate `@media (max-width: 800px)` blocks
**Replace with:** Single consolidated media query block

**Impact**: Reduces duplication, easier responsive design management

## Medium Impact Cleanup

### 5. Reduce !important Usage
**Lines affected**: 60, 190, 200, 328, 338-339, 342, 344-345, 364-367, 398

**Strategy:**
- Review CSS specificity issues
- Reorganize selectors to avoid !important
- Use more specific selectors instead

### 6. Consolidate Cursor Pointer Rules
**Lines affected**: 377, 430, 717, 1133, 1149, 1357, 1361, 1843, 1987

**Current:** 9 separate cursor: pointer rules
**Replace with:** Utility class for interactive elements

### 7. Clean Up Duplicate .cd-filter Rules
**Lines affected**: 875-883, 1447-1469

**Strategy:**
- Merge duplicate properties
- Create proper cascade hierarchy
- Remove conflicting rules

## Low Impact Cleanup

### 8. Standardize Spacing in CSS
- Add consistent spacing around selectors
- Standardize indentation
- Remove unnecessary whitespace

### 9. Group Related Rules
- Move all utility classes together
- Group component styles logically
- Separate layout from visual styling

## Estimated Impact

**File Size Reduction**: ~300-400 lines (10-12%)
**Maintainability**: Significantly improved
**Performance**: Minimal but positive
**Browser Support**: Maintained for modern browsers (IE11+)

## Implementation Priority

1. **High Impact** - Immediate cleanup (1-2 hours)
2. **Medium Impact** - Gradual refactoring (3-4 hours)
3. **Low Impact** - Code quality improvements (1-2 hours)

**Total Estimated Time**: 5-8 hours of focused cleanup work
