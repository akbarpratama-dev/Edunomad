import { z } from "zod";
import { ProjectStatus } from "../constants/projectStatus";

const STATUS_VALUES = Object.values(ProjectStatus) as [string, ...string[]];

export const createProjectSchema = z
  .object({
    category_id: z.string().uuid(),
    title: z.string().min(3).max(255),
    description: z.string().min(1),
    expected_deliverables: z.string().min(1),
    image_url: z.string().url().max(1000).optional().nullable(),
    start_date: z.coerce.date(),
    deadline: z.coerce.date(),
  })
  .refine((d) => d.deadline >= d.start_date, {
    path: ["deadline"],
    message: "Deadline harus setelah atau sama dengan tanggal mulai",
  });

export const updateProjectSchema = createProjectSchema;

export const projectImageUploadSchema = z.object({
  file_name: z.string().min(1).max(200),
});

export const listProjectsQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().uuid().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  hasSenior: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const myProjectsQuerySchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const projectIdParamSchema = z.object({ id: z.string().uuid() });

export const rejectProjectSchema = z.object({
  reason: z.string().min(1, "Alasan wajib diisi").max(2000),
});

export const replaceSeniorSchema = z.object({
  new_senior_id: z.string().uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type MyProjectsQuery = z.infer<typeof myProjectsQuerySchema>;
