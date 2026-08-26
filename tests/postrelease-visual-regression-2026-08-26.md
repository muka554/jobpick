# Post-Release Homepage Visual Regression — 2026-08-26

## Scope

The live release was screened at the homepage’s responsive boundaries and representative desktop/tablet/mobile viewport sizes: `320×568`, `375×667`, `390×844`, `540×720`, `541×720`, `640×900`, `641×900`, `768×1024`, `1024×768`, `1280×800`, and `1440×900`.

## Initial live finding

The initial live suite found no overlapping sibling layout blocks, no clipped fixed privacy control, and no consent-banner conflict after a choice. It did find one **9-pixel horizontal overflow at 641 pixels**. The overflow came from the homepage language picker retaining the generic `.field` grid wrapper immediately above the `max-width:640px` breakpoint.

## Correction and verification

The language picker was moved to its dedicated `.site-language-control` wrapper. The full eleven-breakpoint suite was rerun against the corrected local static build. It reported **zero failures**: no horizontal overflow; no overlap among major sequential sections, navigation children, search-panel children, or filter children; no visible consent banner after the recorded essential-only choice; and a visible privacy settings control inside each viewport that received pointer input.

Direct visual inspection was also completed at `320×568` and `641×900`. The smallest layout stacks content without clipping, and the previously failing 641-pixel threshold contains the language picker within the navigation width.

## Publication note

This report records the pre-publication verification of the 641-pixel correction. The correction must be committed, deployed, and then rechecked on the live domain before it is considered production-verified.
