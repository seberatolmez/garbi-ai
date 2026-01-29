import { withAuth } from "next-auth/middleware"

export default withAuth({
    pages: {
        signIn: "/login"
    }
})

// Protect all routes except: login page, api/auth, _next, favicon.ico, garbi-logo.png
export const config = {
    matcher: [
        "/((?!login|api/auth|_next|favicon.ico|garbi-logo.png).*)"
    ]
}
