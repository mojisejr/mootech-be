export function CalculateYearToYearThai(year: number): number {
  if (year) {
    return year + 543;
  }
  return 0;
}

export function CalculateDateEngToDAteChinese(dateEng: string): string {
  const dobArray = dateEng.split('-');
  const year = parseInt(dobArray[0]);
  const month = parseInt(dobArray[1]);
  const date = parseInt(dobArray[2]);
  const monthTxt = dobArray[1];
  const dateTxt = dobArray[2];

  if (month == 1 || (month == 2 && date < 4)) {
    return `${year - 1}-${monthTxt}-${dateTxt}`;
  }
  return dateEng;
}
