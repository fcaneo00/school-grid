export interface TeacherTimeConstraint {
  day: Weekday
  not_before?: number
  not_after?: number
}

export function useTeacherTimeConstraint() {
  async function saveTimeConstraints(teacherId: number, constraints: TeacherTimeConstraint[]) {
    const db = await getDb()
    await db.execute('DELETE FROM teacher_time_constraint WHERE teacher_id = $1', [teacherId])
    for (const constraint of constraints) {
      await db.execute(
        'INSERT INTO teacher_time_constraint (teacher_id, day, not_before, not_after) VALUES ($1, $2, $3, $4)',
        [teacherId, constraint.day, constraint.not_before ?? null, constraint.not_after ?? null]
      )
    }
  }

  async function deleteTimeConstraints(teacherId: number) {
    const db = await getDb()
    await db.execute('DELETE FROM teacher_time_constraint WHERE teacher_id = $1', [teacherId])
  }

  return {
    saveTimeConstraints,
    deleteTimeConstraints
  }
}
