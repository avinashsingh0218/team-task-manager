export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const due = new Date(dueDate);
  // because timezone might shift things, let's normalize due date too
  const dueNormalized = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return dueNormalized < today;
};
