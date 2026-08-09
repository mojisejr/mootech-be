import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

// PDPA acceptance record (mootech-fe#233). One row per acceptance — this is
// auditable history, not a current-state flag. Table created by
// migrations/2026-08-09_onboarding-consent.sql (synchronize is off).
// No PII beyond the FK user_id: we deliberately do NOT store IP (IP is personal data).
@Entity({ comment: 'PDPA consent acceptance history' })
export class Consent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  user_id: string;

  @Column()
  accepted_at: string;

  @Column()
  policy_version: string;
}
