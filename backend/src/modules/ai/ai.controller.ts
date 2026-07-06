import { Request, Response, NextFunction } from "express";
import { aiInsightService } from "../../services/aiInsight.service";
import { successResponse } from "../../utils/response";

// All AI endpoints return the AiResult envelope inside a normal 200 success
// response — including the { available:false } case — so the frontend can tell
// "AI is off/unavailable" apart from a real error (D-AI-1).
function isRegenerate(req: Request): boolean {
  return req.query.regenerate === "true";
}

export const aiController = {
  // GET /projects/:id/applicants/ranking (SENIOR lead)
  async applicantRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiInsightService.rankApplicants(
        req.user!.id,
        req.params.id,
        isRegenerate(req)
      );
      res.json(successResponse(data, "Applicant ranking"));
    } catch (err) {
      next(err);
    }
  },

  // GET /projects/:id/portfolio-recommendation (BEGINNER, own)
  async portfolioRecommendation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiInsightService.recommendPortfolio(
        req.user!.id,
        req.params.id,
        isRegenerate(req)
      );
      res.json(successResponse(data, "Portfolio recommendation"));
    } catch (err) {
      next(err);
    }
  },

  // GET /users/me/ai-summary
  async mySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiInsightService.summarizeProfile(req.user!.id, isRegenerate(req));
      res.json(successResponse(data, "Profile summary"));
    } catch (err) {
      next(err);
    }
  },

  // GET /users/:id/ai-summary
  async userSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiInsightService.summarizeProfile(req.params.id, isRegenerate(req));
      res.json(successResponse(data, "Profile summary"));
    } catch (err) {
      next(err);
    }
  },
};
