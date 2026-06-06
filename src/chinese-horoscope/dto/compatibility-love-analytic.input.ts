export class CompatibilityLoveAnalyticInput {
  user_id: string;
  'me': {
    name: string;
    gender: string; // MALE , FEMALE
    dob: string;
    time: string;
  };
  'you': {
    name: string;
    gender: string;
    dob: string;
    time: string;
  };
  type: string;
}
