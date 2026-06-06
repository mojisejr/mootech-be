export class PaymentCodeCreateInput {
  plan_code: string;
  package_code: string;
  description: string;
  expired: string; // 1D , 1M , 1Y
  max_use: number;
}
