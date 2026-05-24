export const formatDateLocal = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalDateKey = (isoString: string | undefined): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Ensure it's a valid date
  if (isNaN(date.getTime())) return "";
  return formatDateLocal(date);
};
