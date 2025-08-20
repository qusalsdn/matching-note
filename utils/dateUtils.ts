export const formatDate = (date: string) => {
  if (!date) return "";

  const newDate = new Date(date);
  const kstDate = new Date(newDate.getTime() + 9 * 60 * 60 * 1000);
  const formattedDate = `${kstDate.getFullYear()}.${String(kstDate.getMonth() + 1).padStart(2, "0")}.${String(
    kstDate.getDate()
  ).padStart(2, "0")} ${String(kstDate.getHours()).padStart(2, "0")}:${String(kstDate.getMinutes()).padStart(2, "0")}`;

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
