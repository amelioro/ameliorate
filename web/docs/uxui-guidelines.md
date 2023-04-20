# UX / UI Guidelines

## Table of Contents

[Introduction](#Introduction)  
[8pt grid system](#8pt-grid-system)  
[Pixels and Accessibility](#pixels-and-accessibility)

## Introduction

Documentation for sharing UX/UI guidelines for the ameliorate project.

## 8pt grid system

These blog posts "[Everything you should know about 8 point grid system in UX design](https://uxplanet.org/everything-you-should-know-about-8-point-grid-system-in-ux-design-b69cb945b18d?gi=d321e6edb7fd)" and "[The 8-Point Grid](https://spec.fm/specifics/8-pt-grid)" offer reasons for sticking to sizes in multiples of 8 - check them out, but the points that seem most relevant are summarized in the below sections.

### How to use it

- Generally try to use px's that are multiples of 8 (e.g. 8, 16, 24, ...). For the case of rems, these will be multiples of 0.5.
- Font size is an exception, use what looks nice.
- For narrow spacings (padding, margin, line height), multiples of 4 can also work.
- Treat this as a default, but if something looks better without meeting the guideline, just go with that.

### Why?

- It provides a visual hierarchy to elements and drives consistent scalability with fewer decisions.
- Helps maintain a consistent feel across the website.
- Helps designers and developers work faster on a project.
- Various device screen sizes are multiples of 8.
- Helps build responsive websites for various devices.

## Pixels and Accessibility

Using `rem` scales sizes with the user's default browser font size. The blog post "[The Surprising Truth About Pixels and Accessibility](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/)" describes different use cases for using `rem` units and `px` units for web components. This is an overview of said post.

## How to use it

- Generally: use `px` for aesthetics, use `rem` for visual clarity or functionality.
- There is no cookie cutter method to "correctly" pick between them, just try your best.
- It can help to test what the sizing looks like at different default font sizes.
  - Change the defaults: [Chrome](https://support.microsoft.com/en-us/microsoft-edge/increase-default-text-size-in-microsoft-edge-c62f80af-381d-0716-25a3-c4856dd3806c), [FireFox](https://support.mozilla.org/en-US/kb/change-fonts-and-colors-websites-use), [Safari](https://support.apple.com/en-gb/HT207209), [Edge](https://support.microsoft.com/en-us/microsoft-edge/increase-default-text-size-in-microsoft-edge-c62f80af-381d-0716-25a3-c4856dd3806c).

### Why?

- The main accessibility consideration when it comes to pixel-vs-em/rem is vision. We want people with limited vision to be able to comfortably read the sentences and paragraphs on our websites and web applications.
- As a general rule, we should give the user as much control as possible, and we should never disable or block their settings from working. For this reason, it's very important to use a relative unit like rem for typography.
