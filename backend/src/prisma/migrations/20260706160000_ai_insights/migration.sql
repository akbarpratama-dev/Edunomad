-- Cached AI-generated insights (D-AI-1). VARCHAR + CHECK instead of a DB enum,
-- matching the project convention. Unique per (kind, subject_user, project);
-- NULLS NOT DISTINCT (PG15+) so SUMMARY rows (null project_id) collapse to one
-- row per user.
CREATE TABLE "ai_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" VARCHAR(20) NOT NULL,
    "subject_user_id" UUID NOT NULL,
    "project_id" UUID,
    "input_hash" VARCHAR(64) NOT NULL,
    "result_json" JSONB NOT NULL,
    "model" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT now(),
    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_insights_kind_check" CHECK ("kind" IN ('SUMMARY', 'MATCH', 'PORTFOLIO_REC'))
);

ALTER TABLE "ai_insights"
    ADD CONSTRAINT "ai_insights_subject_user_id_fkey"
    FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_insights"
    ADD CONSTRAINT "ai_insights_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ai_insights_kind_subject_user_id_project_id_key"
    ON "ai_insights" ("kind", "subject_user_id", "project_id") NULLS NOT DISTINCT;
