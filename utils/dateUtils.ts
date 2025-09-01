import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const utcToKst = (utcString: string) => {
  const koreaTime = dayjs.utc(utcString).tz("Asia/Seoul");
  const formattedDate = koreaTime.format("YYYY-MM-DD HH:mm");
  return formattedDate;
};

export const formatDateToYYYYMMDD = (d: Date): string => {
  const date = new Date(d);
  const parts = date.toLocaleDateString("ko-KR").replace(/\./g, "").trim().split(" ");
  const [year, month, day] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const getCalendarEndDate = (d: string) => {
  const date = new Date(d);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};
