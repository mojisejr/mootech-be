// Inputs for the Omise charge endpoints. Note there is intentionally NO `amount`
// field — the charge amount is derived server-side from `package_code` so the
// client cannot dictate what it pays. (#mootech-omise-payment-hardening)

export class OmiseChargeInput {
  token: string; // Omise card token created client-side by omise.js
  email: string;
  user_id: string;
  payment_by: string;
  package_code: string;
}

export class OmisePromptPayInput {
  email: string;
  user_id: string;
  payment_by: string;
  package_code: string;
}
