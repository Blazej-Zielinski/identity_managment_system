export function nextWeek() {
  let today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
}