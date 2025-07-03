import { httpAction } from './_generated/server';

// Webhook handler for Clerk events
export const clerkWebhook = httpAction(async (ctx, request) => {
  // TODO: Add webhook signature verification
  // Security: This should verify the webhook signature from Clerk
  // See: https://clerk.com/docs/integrations/webhooks/verify

  const payload = await request.json();

  // Handle different webhook events from Clerk
  switch (payload.type) {
    case 'user.created':
    case 'user.updated': {
      const userData = payload.data;

      // Extract user information
      const email = userData.email_addresses?.[0]?.email_address;

      if (email) {
        // Note: We can't directly call syncUser here because webhooks don't have auth context
        // Instead, we'd need to store this data temporarily or use a different approach
        // TODO: Implement proper webhook handling without auth context
      }
      break;
    }

    case 'user.deleted': {
      // Handle user deletion if needed
      // TODO: Implement proper user deletion handling
      break;
    }
  }

  return new Response('OK', { status: 200 });
});
