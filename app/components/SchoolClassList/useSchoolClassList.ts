export function useSchoolClassList() {
  const { schoolClasses, loading, error, fetchSchoolClasses, deleteSchoolClass } = useSchoolClasses()

  onMounted(fetchSchoolClasses)

  return {
    schoolClasses,
    loading,
    error,
    deleteSchoolClass
  }
}
