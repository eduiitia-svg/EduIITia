export const formatDate = (ts) => {
  if (!ts) return "-";

  if (ts instanceof Date) {
    return ts.toLocaleDateString();
  }

  if (ts.toDate) {
    return ts.toDate().toLocaleDateString();
  }

  if (ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleDateString();
  }

  if (typeof ts === "string") {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
  }

  return "N/A";
};
