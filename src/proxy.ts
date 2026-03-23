import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tools/pdf-protect/:path*",
    "/tools/pdf-unlock/:path*",
  ],
};
