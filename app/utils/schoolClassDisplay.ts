export function formatSchoolClassName(schoolClass: { year: number, section_name: string | null, study_track_name: string | null }): string {
  const base = `${schoolClass.year}${schoolClass.section_name ?? ''}`
  return schoolClass.study_track_name ? `${base} - ${schoolClass.study_track_name}` : base
}

export function formatSchoolClassShortName(schoolClass: { year: number, section_name: string | null }): string {
  return `${schoolClass.year}${schoolClass.section_name ?? ''}`
}
