export const formatDate = (date: string) => {
  if (!date) return "";

  const newDate = new Date(date);
  const kstDate = new Date(newDate.getTime() + 9 * 60 * 60 * 1000);
  const formattedDate = `${kstDate.getFullYear()}.${String(kstDate.getMonth() + 1).padStart(2, "0")}.${String(
    kstDate.getDate()
  ).padStart(2, "0")} ${String(kstDate.getHours()).padStart(2, "0")}:${String(kstDate.getMinutes()).padStart(2, "0")}`;

  return formattedDate;
};
