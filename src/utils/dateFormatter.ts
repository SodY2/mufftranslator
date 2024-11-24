export function formatDate(dateString: string | number | Date) {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
  catch {
    return dateString
  }
}
