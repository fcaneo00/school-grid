export function useTeacherPreference() {
  async function saveDayOffs(teacherId: number, dayOffs: Weekday[]) {
    const db = await getDb()
    await db.execute('DELETE FROM preference WHERE teacher_id = $1', [teacherId])
    for (const dayOff of dayOffs) {
      await db.execute('INSERT INTO preference (teacher_id, day_off) VALUES ($1, $2)', [teacherId, dayOff])
    }
  }

  async function deleteDayOff(teacherId: number) {
    const db = await getDb()
    await db.execute('DELETE FROM preference WHERE teacher_id = $1', [teacherId])
  }

  return {
    saveDayOffs,
    deleteDayOff
  }
}
