// Some IDE / TypeScript setups don't recognize side-effect CSS imports from packages
// (e.g. `import "nextra-theme-docs/style-prefixed.css"` will have error `Cannot find module or type declarations for side-effect import of 'nextra-theme-docs/style-prefixed.css'.ts(2882)`)
// because TS strips the .css extension and tries to resolve as a JS module. This declaration tells
// TS that any `.css` import is a side-effect-only module with no exported types.
declare module "*.css";
