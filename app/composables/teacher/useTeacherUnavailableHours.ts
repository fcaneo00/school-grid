export interface TeacherUnavailableHours {
  day: Weekday
  hours: number[]
}

export function useTeacherUnavailableHours() {
  async function saveUnavailableHours(teacherId: number, entries: TeacherUnavailableHours[]) {
    const db = await getDb()
    await db.execute('DELETE FROM teacher_unavailable_hour WHERE teacher_id = $1', [teacherId])
    for (const entry of entries) {
      for (const hourSlot of entry.hours) {
        await db.execute(
          'INSERT INTO teacher_unavailable_hour (teacher_id, day, hour_slot) VALUES ($1, $2, $3)',
          [teacherId, entry.day, hourSlot]
        )
      }
    }
  }

  async function deleteUnavailableHours(teacherId: number) {
    const db = await getDb()
    await db.execute('DELETE FROM teacher_unavailable_hour WHERE teacher_id = $1', [teacherId])
  }

  return {
    saveUnavailableHours,
    deleteUnavailableHours
  }
}
