import { httpAction } from './_generated/server';
import { createWebhookError } from './lib/errors';

/**
 * Webhook handler for Clerk user lifecycle events.
 * Verifies webhook signature and processes user creation/update/deletion events.
 *
 * @param ctx - Convex action context
 * @param request - HTTP request containing Clerk webhook payload
 * @returns HTTP response confirming webhook processing
 * @throws WebhookError if signature verification fails
 *
 * @example
 * ```typescript
 * // Configure webhook endpoint in Clerk dashboard:
 * // URL: https://your-domain.convex.cloud/clerkWebhook
 * // Events: user.created, user.updated, user.deleted
 * ```
 */
export const clerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw createWebhookError('missing_secret');
  }

  // Verify webhook signature
  const signature = request.headers.get('svix-signature');
  if (!signature) {
    throw createWebhookError('invalid_signature');
  }

  // Get request body as text for signature verification
  const body = await request.text();

  // Verify the webhook signature using Clerk's verification
  try {
    const { Webhook } = await import('svix');
    const webhook = new Webhook(webhookSecret);
    const payload = webhook.verify(body, {
      'svix-id': request.headers.get('svix-id') || '',
      'svix-timestamp': request.headers.get('svix-timestamp') || '',
      'svix-signature': signature,
    });

    // Parse the verified payload
    const event = typeof payload === 'string' ? JSON.parse(payload) : payload;

    // Handle different webhook events from Clerk
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const userData = event.data;

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
  } catch (error) {
    console.error('Webhook verification failed:', error);
    throw createWebhookError('invalid_signature');
  }
});
