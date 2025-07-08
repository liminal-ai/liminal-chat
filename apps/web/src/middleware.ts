import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/'],
  },
});

// Match against pages that require auth
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
