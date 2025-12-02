// contact number validator
export const formatPHNumber = (value) => {
  // Remove non-digits
  let v = value.replace(/\D/g, "");

  // Mobile: 09XXXXXXXXX
  if (v.startsWith("09")) {
    if (v.length > 4) v = v.replace(/(\d{4})(\d+)/, "$1-$2");
    if (v.length > 8) v = v.replace(/(\d{4})-(\d{3})(\d+)/, "$1-$2-$3");
    return v.substring(0, 13);
  }

  // Landline: (0XX) XXX-XXXX
  if (v.length <= 3) return v;
  if (v.length <= 6) return `(${v.substring(0, 3)}) ${v.substring(3)}`;
  return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6, 10)}`;
};
