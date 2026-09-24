export function useAssignmentUsages() {
  const { assignments, fetchAssignments } = useAssignments()

  async function byTeacher(teacherId: number) {
    await fetchAssignments()
    return assignments.value.filter((assignment) => assignment.teacher_id === teacherId)
  }

  async function bySchoolClass(schoolClassId: number) {
    await fetchAssignments()
    return assignments.value.filter((assignment) => assignment.school_class_id === schoolClassId)
  }

  async function bySubject(subjectId: number) {
    await fetchAssignments()
    return assignments.value.filter((assignment) => assignment.subject_id === subjectId)
  }

  return {
    byTeacher,
    bySchoolClass,
    bySubject
  }
}
