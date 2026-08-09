// Body for POST /consent — completing v2 first-run (mootech-fe#233).
// user_id comes in the body (repo-wide pattern: no AuthGuard; the FE BFF holds
// the session and passes user_id, same as register-login / user GET).
export class ConsentCompleteOnboardingInput {
  user_id: string;
  goal: string; // GoalId, 1-of-6
  policy_version: string;
}
