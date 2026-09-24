export function useAssignmentOptions() {
  const { teachers, fetchTeachers } = useTeachers()
  const { schoolClasses, fetchSchoolClasses } = useSchoolClasses()

  function fetchOptions() {
    fetchTeachers()
    fetchSchoolClasses()
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

  return {
    fetchOptions,
    teacherOptions,
    schoolClassOptions
  }
}
