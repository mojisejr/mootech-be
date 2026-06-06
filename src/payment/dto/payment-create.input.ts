export class PaymentCreateInput {
  user_id: string;
  email: string;
  payment: {
    plan: string;
    package_code: string;
    package_name: string;
    amount: number;
  };
  slip: {
    file: string;
    date: string;
    time: string;
    amount: number;
  };
}
