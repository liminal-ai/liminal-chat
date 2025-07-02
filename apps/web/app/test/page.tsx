/**
 * Renders a simple HTML test page without any CSS imports.
 *
 * Displays a heading and two paragraphs to verify that Next.js is rendering content correctly.
 *
 * @returns A JSX element representing the test page structure.
 */
export default function TestPage() {
  return (
    <html>
      <body>
        <h1>Test Page - No CSS</h1>
        <p>This page has no CSS imports.</p>
        <p>If you can see this, Next.js is working!</p>
      </body>
    </html>
  );
}