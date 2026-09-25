export function formatTeacherShortName(lastName: string, firstName: string) {
  const initials = firstName
    .trim()
    .split(/\s+/)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('.')
  return `${lastName} ${initials}.`
}
