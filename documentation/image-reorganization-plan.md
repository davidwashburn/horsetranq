# Image Reorganization Plan for Horsetranq

## Current State Analysis

### Problems Identified:
1. **Mixed Purpose Images**: Game assets mixed with marketing/branding images
2. **Inconsistent Naming**: Various naming conventions across folders
3. **Duplicate Structures**: Multiple loading folders, scattered GIFs
4. **Unclear Categorization**: Hard to distinguish between website UI, game assets, and marketing materials
5. **Legacy Files**: Old branding versions and unused assets cluttering directories

### Current Usage Patterns:
- **Templates**: Primarily use `/branding/` images for hero sections and logos
- **Games**: Horsplay uses extensive `/games/horsplay/` assets and backgrounds
- **CSS**: Uses `/assets/ux/` SVG icons for UI elements
- **JavaScript**: Heavy game asset loading from `/games/horsplay/assets/`

## Proposed New Structure (Simplified)

```
static/img/
├── ui/                           # Website UI elements
│   ├── icons/                    # SVG icons for interface
│   │   ├── arrow.svg
│   │   ├── arrow-small.svg
│   │   ├── arrow-small-dark.svg
│   │   ├── check.svg
│   │   ├── menu.svg
│   │   ├── discord.svg
│   │   ├── patreon.svg
│   │   └── atlassian.svg
│   ├── loading/                  # Loading animations for website
│   │   ├── hors-load-1.gif
│   │   ├── hors-load-2.gif
│   │   └── hors-load-3.gif
│   └── hors.ico                  # Favicon
│
├── branding/                     # Core brand assets
│   ├── horsetranq-logo.png       # Main logos
│   ├── horsetranq-v3.png
│   ├── hors-foundation.png
│   ├── horsetranq-v3-about.png   # Hero section images
│   ├── horsetranq-v3-money-explosion.gif
│   ├── horsetranq-v3-this-is-horsetranq.png
│   ├── horsetranq-v3-intensity-1.gif  # Animation sequences
│   ├── horsetranq-v3-intensity-2.gif
│   ├── horsetranq-v3-intensity-3.gif
│   ├── horsetranq-v3-intensity-4.gif
│   ├── horsetranq-v3-intensity-5.gif
│   ├── horsetranq-v3-intensity-6.gif
│   ├── hors-one.png              # Subscription tiers
│   ├── hors-plus.png
│   ├── hors-max.png
│   ├── season-1.png
│   ├── season-2.png
│   └── legacy/                   # Old versions (keep for reference)
│       ├── game-horsetranq-alt.png
│       ├── game-horsetranq-alt-large.png
│       ├── horsetranq-support.png
│       ├── background-hi-rez.png
│       └── background-low-rez.png
│
├── marketing/                    # Marketing and promotional content
│   ├── utube.svg                 # Marketing/promotional icons
│   ├── trash.svg
│   ├── ht-shirt.png              # Merchandise designs
│   ├── mthbwy-shirt.png
│   ├── harrytrotter.png          # Promotional images
│   ├── mthbwy.png
│   └── design-files/             # Source files
│       ├── Horsetranq.pxz
│       ├── MTHBWY.pxz
│       └── branding.pxz
│
├── games/                        # Game-specific assets
│   ├── horsplay/                 # Horsplay game assets
│   │   ├── assets/               # All game sprites/items (flat structure)
│   │   │   ├── hors-1.png
│   │   │   ├── hors-2.png
│   │   │   ├── hors-3.png
│   │   │   ├── hors-idiot.png
│   │   │   ├── hors-tranq.png
│   │   │   ├── person-1.png
│   │   │   ├── person-2.png
│   │   │   ├── person-3.png
│   │   │   ├── person-4.png
│   │   │   ├── dog-1.png
│   │   │   ├── dog-2.png
│   │   │   ├── dog-3.png
│   │   │   ├── goose-1.png
│   │   │   ├── ravn-1.png
│   │   │   ├── ravn-2.png
│   │   │   ├── ravn-3.png
│   │   │   ├── ravn-tranq.png
│   │   │   ├── tranq.png
│   │   │   ├── tranq-alt.png
│   │   │   ├── tranq-large.png
│   │   │   ├── tools-1.png
│   │   │   ├── tools-2.png
│   │   │   ├── tools-3.png
│   │   │   ├── tractor-1.png
│   │   │   ├── tractor-2.png
│   │   │   └── tractor-3.png
│   │   ├── backgrounds/          # Game backgrounds
│   │   │   ├── farm-bg-day.jpg
│   │   │   ├── farm-bg-day-alt.jpg
│   │   │   ├── farm-bg-dusk.jpg
│   │   │   ├── farm-bg-night.jpg
│   │   │   ├── farm-bg-overcast.jpg
│   │   │   ├── farm-bg-peaceful.jpg
│   │   │   ├── mood-bg-1.png
│   │   │   ├── mood-bg-2.png
│   │   │   ├── mood-bg-3.png
│   │   │   ├── mood-bg-4.png
│   │   │   ├── mood-bg-5.png
│   │   │   ├── mood-bg-6.png
│   │   │   ├── peaceful.png
│   │   │   └── peaceful-alt.png
│   │   └── promo/                # Game promotional images
│   │       ├── game-horsetranq.png
│   │       ├── ranked-mode.png
│   │       ├── helmet-a.png
│   │       ├── game-gallopgun.png
│   │       ├── game-trottank.png
│   │       └── game-trottank-alt.png
│   │
│   └── lemondrop/                # Lemondrop game assets
│       ├── assets/               # All game sprites (flat structure)
│       │   ├── bear.png
│       │   ├── lemon.png
│       │   └── ContextWindow.png
│       ├── backgrounds/          # Game backgrounds
│       │   ├── background.png
│       │   ├── bg-align-middle.png
│       │   └── bg-wide.png
│       └── promo/                # Game promotional images
│           ├── lemondrop.png
│           └── lemondrop-alt.png
│
└── animations/                   # Animated GIFs (website use)
    ├── bear.gif
    ├── dog-1.gif
    ├── dog-2.gif
    ├── dog-3.gif
    ├── goose.gif
    ├── hors-1.gif
    ├── hors-2.gif
    ├── hors-3.gif
    ├── person-1.gif
    ├── person-2.gif
    ├── person-3.gif
    ├── raven.gif
    ├── glock.gif
    ├── helmet.gif
    ├── tool-1.gif
    ├── tool-2.gif
    ├── tranq-1.gif
    ├── tranq-2.gif
    ├── lemon-1.gif
    ├── hors-money.gif
    ├── hors-support.gif
    ├── horsetranq.gif
    └── koala.png
```

## Migration Benefits

### 1. **Clear Separation of Concerns**
- **UI Elements**: Easy to find interface components
- **Branding**: Centralized brand assets with version control
- **Marketing**: Dedicated space for promotional content
- **Games**: Organized by game with logical subcategories
- **Animations**: Separate space for animated content

### 2. **Improved Developer Experience**
- **Predictable Paths**: Developers know exactly where to find assets
- **Logical Grouping**: Related assets are grouped together
- **Version Management**: Legacy assets preserved but separated
- **Scalability**: Easy to add new games or asset types

### 3. **Performance Benefits**
- **Reduced Search Time**: Faster asset location during development
- **Better Caching**: More predictable cache patterns
- **Easier Optimization**: Clear separation allows targeted optimization

### 4. **Maintenance Advantages**
- **Easy Cleanup**: Legacy assets clearly marked
- **Consistent Naming**: Standardized naming conventions
- **Clear Dependencies**: Easier to track what's used where

## Implementation Plan

### Phase 1: Create New Structure
1. Create new directory structure
2. Copy files to new locations (don't move yet)
3. Update file references in templates
4. Update CSS background-image paths
5. Update JavaScript asset paths

### Phase 2: Update Code References
1. **Templates**: Update all `src` attributes
2. **CSS**: Update all `url()` references  
3. **JavaScript**: Update all asset paths
4. **Game Scripts**: Update character and background arrays

### Phase 3: Testing & Validation
1. Test all pages load correctly
2. Verify game assets load properly
3. Check all animations work
4. Validate no broken image links

### Phase 4: Cleanup
1. Remove old directory structure
2. Update any documentation
3. Clear unused legacy assets

## File Count Summary

**Current Structure**: ~150+ files across 15+ directories
**New Structure**: Same files, organized into 25+ logical directories

## Risk Mitigation

1. **Backup**: Full backup before starting migration
2. **Incremental**: Move files in phases, not all at once
3. **Testing**: Thorough testing after each phase
4. **Rollback Plan**: Keep old structure until fully validated

## Estimated Timeline

- **Planning & Setup**: 1-2 hours
- **File Migration**: 2-3 hours  
- **Code Updates**: 3-4 hours
- **Testing**: 1-2 hours
- **Cleanup**: 1 hour

**Total**: 8-12 hours of development time

This reorganization will create a much more maintainable and scalable image structure that clearly separates concerns and makes asset management significantly easier.
