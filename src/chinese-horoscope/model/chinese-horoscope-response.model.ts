export class ChineseHoroscopeResponse {
  code?: string;
  dob: string;
  time: string;
  summary: {
    element: any;
    power: any;
    yearAbove: any;
    yearBelow: any;
    monthAbove: any;
    monthBelow: any;
    dayAbove: any;
    dayBelow: any;
    timeAbove: any;
    timeBelow: any;
  };
  detail: {
    yearAbove: any;
    yearBelow: any;
    monthAbove: any;
    monthBelow: any;
    dayAbove: any;
    dayBelow: any;
    timeAbove: any;
    timeBelow: any;
  };
  share_profile_url?: any;
}
