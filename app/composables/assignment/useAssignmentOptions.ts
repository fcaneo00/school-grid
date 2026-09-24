export function useAssignmentOptions() {
  const { teachers, fetchTeachers } = useTeachers()
  const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()
  const { subjects, fetchSubjects } = useSubjects()

  function fetchOptions() {
    fetchTeachers()
    fetchSchoolClasses()
    fetchSubjects()
  }

  const teacherOptions = computed(() =>
    teachers.value.map((teacher) => ({
      label: `${teacher.last_name} ${teacher.first_name}`,
      value: teacher.id
    }))
  )

  const schoolClassOptions = computed(() =>
    schoolClasses.value.map((schoolClass) => ({
      label: formatSchoolClassName(schoolClass),
      value: schoolClass.id
    }))
  )

  const subjectOptions = computed(() =>
    subjects.value.map((subject) => ({
      label: subject.name,
      value: subject.id
    }))
  )

  return {
    fetchOptions,
    teacherOptions,
    schoolClassOptions,
    subjectOptions
  }
}
