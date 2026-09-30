use tauri_plugin_sql::{Migration, MigrationKind};

fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            kind: MigrationKind::Up,
            sql: "
      CREATE TABLE teacher (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
      );

      CREATE TABLE school_class (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        section TEXT NOT NULL
      );

      CREATE TABLE subject (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE assignment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL REFERENCES teacher(id),
        school_class_id INTEGER NOT NULL REFERENCES school_class(id),
        subject_id INTEGER NOT NULL REFERENCES subject(id),
        weekly_hours INTEGER NOT NULL
      );

      CREATE TABLE preference (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL REFERENCES teacher(id),
        day_off TEXT NOT NULL
      );

      CREATE TABLE schedule_entry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL REFERENCES assignment(id),
        day TEXT NOT NULL,
        hour_slot INTEGER NOT NULL
      );

      CREATE INDEX idx_schedule_entry_day_hour ON schedule_entry(day, hour_slot);
      CREATE INDEX idx_assignment_teacher ON assignment(teacher_id);
      CREATE INDEX idx_assignment_school_class ON assignment(school_class_id);
    ",
        },
        Migration {
            version: 2,
            description: "school_class_year_and_study_track",
            kind: MigrationKind::Up,
            sql: "
      ALTER TABLE school_class RENAME COLUMN name TO year;
      ALTER TABLE school_class ADD COLUMN study_track TEXT NOT NULL DEFAULT '';
    ",
        },
        Migration {
            version: 3,
            description: "study_track_as_entity",
            kind: MigrationKind::Up,
            sql: "
      CREATE TABLE study_track (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      INSERT INTO study_track (name)
      SELECT DISTINCT study_track FROM school_class WHERE study_track != '';

      ALTER TABLE school_class ADD COLUMN study_track_id INTEGER REFERENCES study_track(id);

      UPDATE school_class
      SET study_track_id = (SELECT id FROM study_track WHERE study_track.name = school_class.study_track)
      WHERE study_track != '';

      ALTER TABLE school_class DROP COLUMN study_track;

      CREATE INDEX idx_school_class_study_track ON school_class(study_track_id);
    ",
        },
        Migration {
            version: 4,
            description: "section_as_entity",
            kind: MigrationKind::Up,
            sql: "
      CREATE TABLE section (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      INSERT INTO section (name)
      SELECT DISTINCT section FROM school_class WHERE section != '';

      ALTER TABLE school_class ADD COLUMN section_id INTEGER REFERENCES section(id);

      UPDATE school_class
      SET section_id = (SELECT id FROM section WHERE section.name = school_class.section)
      WHERE section != '';

      ALTER TABLE school_class DROP COLUMN section;

      CREATE INDEX idx_school_class_section ON school_class(section_id);
    ",
        },
        Migration {
            version: 5,
            description: "drop_subject",
            kind: MigrationKind::Up,
            sql: "
      ALTER TABLE assignment DROP COLUMN subject_id;
      DROP TABLE subject;
    ",
        },
        Migration {
            version: 6,
            description: "school_class_unique",
            kind: MigrationKind::Up,
            sql: "
      CREATE TEMP TABLE school_class_dup AS
      SELECT MIN(id) AS keeper_id, year, section_id, study_track_id
      FROM school_class
      WHERE section_id IS NOT NULL AND study_track_id IS NOT NULL
      GROUP BY year, section_id, study_track_id
      HAVING COUNT(*) > 1;

      UPDATE assignment
      SET school_class_id = (
        SELECT d.keeper_id FROM school_class_dup d
        JOIN school_class sc ON sc.year = d.year AND sc.section_id = d.section_id AND sc.study_track_id = d.study_track_id
        WHERE sc.id = assignment.school_class_id
      )
      WHERE school_class_id IN (
        SELECT sc.id FROM school_class sc
        JOIN school_class_dup d ON sc.year = d.year AND sc.section_id = d.section_id AND sc.study_track_id = d.study_track_id
        WHERE sc.id != d.keeper_id
      );

      DELETE FROM school_class
      WHERE id IN (
        SELECT sc.id FROM school_class sc
        JOIN school_class_dup d ON sc.year = d.year AND sc.section_id = d.section_id AND sc.study_track_id = d.study_track_id
        WHERE sc.id != d.keeper_id
      );

      DROP TABLE school_class_dup;

      CREATE UNIQUE INDEX idx_school_class_unique ON school_class(year, section_id, study_track_id);
    ",
        },
        Migration {
            version: 7,
            description: "schedule_entry_denormalized_constraints",
            kind: MigrationKind::Up,
            sql: "
      ALTER TABLE schedule_entry ADD COLUMN teacher_id INTEGER NOT NULL REFERENCES teacher(id);
      ALTER TABLE schedule_entry ADD COLUMN school_class_id INTEGER NOT NULL REFERENCES school_class(id);

      CREATE UNIQUE INDEX idx_schedule_entry_teacher_slot ON schedule_entry(day, hour_slot, teacher_id);
      CREATE UNIQUE INDEX idx_schedule_entry_class_slot ON schedule_entry(day, hour_slot, school_class_id);
    ",
        },
        Migration {
            version: 8,
            description: "school_class_weekly_hours",
            kind: MigrationKind::Up,
            sql: "
      ALTER TABLE school_class ADD COLUMN weekly_hours INTEGER;
    ",
        },
        Migration {
            version: 9,
            description: "app_settings",
            kind: MigrationKind::Up,
            sql: "
      CREATE TABLE app_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        max_daily_hours INTEGER NOT NULL DEFAULT 6,
        active_weekdays TEXT NOT NULL DEFAULT 'monday,tuesday,wednesday,thursday,friday,saturday'
      );

      INSERT INTO app_settings (id, max_daily_hours, active_weekdays)
      VALUES (1, 6, 'monday,tuesday,wednesday,thursday,friday,saturday');
    ",
        },
        Migration {
            version: 10,
            description: "teacher_time_constraint",
            kind: MigrationKind::Up,
            sql: "
      CREATE TABLE teacher_time_constraint (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL REFERENCES teacher(id),
        day TEXT NOT NULL,
        not_before INTEGER,
        not_after INTEGER,
        CHECK (not_before IS NOT NULL OR not_after IS NOT NULL)
      );

      CREATE INDEX idx_teacher_time_constraint_teacher ON teacher_time_constraint(teacher_id);
    ",
        },
        Migration {
            version: 11,
            description: "teacher_max_consecutive_hours",
            kind: MigrationKind::Up,
            sql: "
      ALTER TABLE teacher ADD COLUMN max_consecutive_hours INTEGER;
    ",
        },
        Migration {
            version: 12,
            description: "teacher_unavailable_hour",
            kind: MigrationKind::Up,
            sql: "
      DROP TABLE teacher_time_constraint;

      CREATE TABLE teacher_unavailable_hour (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL REFERENCES teacher(id),
        day TEXT NOT NULL,
        hour_slot INTEGER NOT NULL,
        UNIQUE(teacher_id, day, hour_slot)
      );

      CREATE INDEX idx_teacher_unavailable_hour_teacher ON teacher_unavailable_hour(teacher_id);
    ",
        },
    ]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:_template.db", migrations())
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
