export const formatPhoneForWhatsApp = (phone: string): string => {
  return phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
};

export const openWhatsApp = (phone: string): void => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  window.open(`https://wa.me/${formattedPhone}`, '_blank');
};
