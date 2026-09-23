export function useTeacherList() {
  const { teachers, loading, error, fetchTeachers, deleteTeacher } = useTeachers()

  onMounted(fetchTeachers)

  return {
    teachers,
    loading,
    error,
    deleteTeacher
  }
}
