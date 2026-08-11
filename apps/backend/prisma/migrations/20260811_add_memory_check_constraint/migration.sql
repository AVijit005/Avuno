ALTER TABLE "memories" ADD CONSTRAINT "check_evidence_limit" CHECK ("journal_id" IS NULL OR "quote_id" IS NULL);
