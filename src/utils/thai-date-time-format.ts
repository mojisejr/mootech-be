const formatDateThaiShort = (date: string) => {
  if (date === undefined || date === null) return date;
  const dateArray = date.split('-');
  if (dateArray.length >= 3) {
    const day = parseInt(dateArray[2]);
    const month = parseInt(dateArray[1]);
    const year = parseInt(dateArray[0]);
    return `${day} ${getMonthThaiShort(month)} ${getYearThai(year)}`;
  }
  return date;
};

const formatDateShort = (date: string) => {
  if (date === undefined || date === null) return date;
  const dateArray = date.split('-');
  if (dateArray.length >= 3) {
    const day = dateArray[2];
    const month = dateArray[1];
    const year = dateArray[0];
    return `${day}/${month}/${year}`;
  }
  return date;
};

const formatDateOnlyShort = (date: string) => {
  if (date === undefined || date === null) return date;
  const datetimeArray = date.split(' ');
  if (datetimeArray.length >= 2) {
    const dateArray = datetimeArray[0].split('-');
    if (dateArray.length >= 3) {
      const day = dateArray[2];
      const month = dateArray[1];
      const year = dateArray[0].substring(2);
      return `${day}/${month}/${year}`;
    }
  } else {
    const dateArray = date.split('-');
    if (dateArray.length >= 3) {
      const day = dateArray[2];
      const month = dateArray[1];
      const year = dateArray[0].substring(2);
      return `${day}/${month}/${year}`;
    }
  }
  return date;
};

const formatMonthYearThaiShort = (date: string) => {
  if (date === undefined || date === null) return date;
  const dateArray = date.split('-');
  if (dateArray.length >= 3) {
    const day = parseInt(dateArray[2]);
    const month = parseInt(dateArray[1]);
    const year = parseInt(dateArray[0]);
    return `${getMonthThaiFull(month)} ${getYearThai(year)}`;
  }
  return date;
};

const formatDateThai = (date: string) => {
  if (date === undefined || date === null) return date;
  const dateArray = date.split('-');
  if (dateArray.length >= 3) {
    const day = parseInt(dateArray[2]);
    const month = parseInt(dateArray[1]);
    const year = parseInt(dateArray[0]);
    return `${day} ${getMonthThaiFull(month)} พ.ศ.${getYearThai(year)}`;
  }
  return date;
};

const getMonthThaiShort = (month: number) => {
  switch (month) {
    case 1:
      return 'ม.ค.';
    case 2:
      return 'ก.พ.';
    case 3:
      return 'มี.ค.';
    case 4:
      return 'เม.ย.';
    case 5:
      return 'พ.ค.';
    case 6:
      return 'มิ.ย.';
    case 7:
      return 'ก.ค.';
    case 8:
      return 'ส.ค.';
    case 9:
      return 'ก.ย.';
    case 10:
      return 'ต.ค.';
    case 11:
      return 'พ.ย.';
    case 12:
      return 'ธ.ค.';
  }
  return month;
};

const getMonthThaiFull = (month: number) => {
  switch (month) {
    case 1:
      return 'มกราคม';
    case 2:
      return 'กุมภาพันธ์';
    case 3:
      return 'มีนาคม';
    case 4:
      return 'เมษายน';
    case 5:
      return 'พฤษภาคม';
    case 6:
      return 'มิถุนายน';
    case 7:
      return 'กรกฎาคม';
    case 8:
      return 'สิงหาคม';
    case 9:
      return 'กันยายน';
    case 10:
      return 'ตุลาคม';
    case 11:
      return 'พฤศจิกายน';
    case 12:
      return 'ธันวาคม';
  }
  return month;
};

const getYearThai = (year: number) => {
  return year + 543;
};

export {
  formatDateThaiShort,
  formatMonthYearThaiShort,
  formatDateShort,
  formatDateOnlyShort,
  formatDateThai,
};
