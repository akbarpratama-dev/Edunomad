import { Request, Response, NextFunction } from "express";
import { artifactService } from "../../services/artifact.service";
import { successResponse } from "../../utils/response";

export const artifactController = {
  // POST /projects/:id/generate-artifacts (SENIOR lead)
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.generateArtifacts(
        req.user!.id,
        req.params.id,
        req.body.beginner_ids,
        req.body.verification_url
      );
      res.status(201).json(successResponse(data, "Artifacts generated"));
    } catch (err) {
      next(err);
    }
  },

  // POST /artifacts/:id/regenerate (SENIOR lead)
  async regenerate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.regenerateArtifact(
        req.user!.id,
        req.params.id,
        req.body.verification_url
      );
      res.json(successResponse(data, "Artifact regenerated"));
    } catch (err) {
      next(err);
    }
  },

  // GET /artifacts — the caller's own certificates
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.listMine(req.user!.id);
      res.json(successResponse(data, "Artifacts retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /projects/:id/artifacts — certificates for a project
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.listForProject(req.params.id);
      res.json(successResponse(data, "Artifacts retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /artifacts/:id
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.getArtifactDetail(req.params.id);
      res.json(successResponse(data, "Artifact retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /artifacts/:id/download — streams the PDF
  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { buffer, filename } = await artifactService.downloadPdf(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  },

  // GET /verify/:artifactCode (PUBLIC)
  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.verify(req.params.artifactCode);
      res.json(successResponse(data, data.valid ? "Artifact valid" : "Artifact not found"));
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/artifacts (ADMIN)
  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artifactService.listAll();
      res.json(successResponse(data, "Artifacts retrieved"));
    } catch (err) {
      next(err);
    }
  },
};
