import { SignIn } from '@clerk/nextjs';

/**
 * Renders a full-page, centered sign-in interface using the Clerk authentication component.
 *
 * Displays the sign-in form centered both vertically and horizontally on a light gray background.
 */
export default function SignInPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <SignIn />
    </div>
  );
}