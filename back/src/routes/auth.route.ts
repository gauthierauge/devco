import { Router, Request, Response } from "express"
import { asyncHandler } from "@/middleware/error.js"
import { registerHandler, loginHandler, logoutHandler, getCurrentUserHandler } from "@/controllers/auth.controller.js"
import { authMiddleware } from "@/middleware/security/auth.js"

const authRouter = Router()

authRouter.post("/register", asyncHandler(registerHandler))
authRouter.post("/login", asyncHandler(loginHandler))
authRouter.post("/logout", asyncHandler(logoutHandler))
authRouter.get("/me", authMiddleware, asyncHandler(getCurrentUserHandler))

authRouter.get("/csrf-token", (req: Request, res: Response) => {
    const token = res.locals.csrfToken
    res.json({ csrfToken: token })
})

export { authRouter }
