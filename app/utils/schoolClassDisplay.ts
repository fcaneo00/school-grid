export function formatSchoolClassName(schoolClass: { year: number, section: string, study_track_name: string | null }): string {
  const base = `${schoolClass.year}${schoolClass.section}`
  return schoolClass.study_track_name ? `${base} - ${schoolClass.study_track_name}` : base
}
