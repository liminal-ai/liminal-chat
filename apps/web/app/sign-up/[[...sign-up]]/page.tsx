import { SignUp } from '@clerk/nextjs';

/**
 * Renders a centered sign-up page with a light gray background and the Clerk SignUp component.
 *
 * Displays the user registration interface centered both vertically and horizontally within the viewport.
 */
export default function SignUpPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <SignUp />
    </div>
  );
}