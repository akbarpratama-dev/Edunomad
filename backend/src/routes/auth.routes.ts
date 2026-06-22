import { Router } from "express";
import { authMiddleware, requireSupabaseUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { authController } from "../modules/auth/auth.controller";
import { registerSchema, signupSchema } from "../validators/auth.validator";

const router = Router();

// Step 1: public account creation (email-confirmed via admin API).
router.post("/signup", validateRequest({ body: signupSchema }), authController.signup);

// Registration completes after the wizard — the public.users row doesn't
// exist yet, so it uses the lenient requireSupabaseUser (valid JWT only).
router.post(
  "/register",
  requireSupabaseUser,
  validateRequest({ body: registerSchema }),
  authController.register
);

// Both require a valid session. API spec lists /auth/me as "Public" meaning
// no role restriction — but "current user" is meaningless without a token, so
// authMiddleware (any authenticated app user) gates both.
router.get("/me", authMiddleware, authController.me);
router.post("/logout", authMiddleware, authController.logout);

export default router;
