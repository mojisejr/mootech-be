export class PaymentCreateViaOmiseInput {
  user_id: string;
  email: string;
  payment: {
    package_code: string;
  };
  info: {
    charge_id: string;
    order_id: string;
    payment_by: string;
  };
}
