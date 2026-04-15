// Type declarations for CSS imports
// This allows importing CSS files in TypeScript without errors
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
