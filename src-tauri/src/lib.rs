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
                .add_migrations("sqlite:school-grid.db", migrations())
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
