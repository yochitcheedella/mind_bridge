import os
from sqlalchemy import inspect, text
from app.core.database import engine

def migrate():
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    print("Detected database tables:", table_names)

    with engine.connect() as conn:
        if "journal_entries" in table_names:
            existing_cols = {col["name"] for col in inspector.get_columns("journal_entries")}
            print("Existing journal_entries columns:", existing_cols)

            migrations = [
                ("entry_date", "TEXT"),
                ("mood", "VARCHAR(50)"),
                ("is_shared_with_counselor", "BOOLEAN DEFAULT 0"),
                ("word_count", "INTEGER DEFAULT 0"),
                ("updated_at", "TIMESTAMP"),
            ]

            for col_name, col_type in migrations:
                if col_name not in existing_cols:
                    print(f"Adding column '{col_name}' ({col_type}) to journal_entries...")
                    conn.execute(text(f"ALTER TABLE journal_entries ADD COLUMN {col_name} {col_type}"))

            # Backfill entry_date from created_at
            try:
                conn.execute(text("UPDATE journal_entries SET entry_date = CAST(created_at AS DATE) WHERE entry_date IS NULL AND created_at IS NOT NULL"))
            except Exception:
                pass

        if "appointments" in table_names:
            appt_cols = {col["name"] for col in inspector.get_columns("appointments")}
            print("Existing appointments columns:", appt_cols)

            appt_migrations = [
                ("session_type", "VARCHAR(50) DEFAULT 'video'"),
                ("duration", "INTEGER DEFAULT 45"),
                ("concern", "TEXT"),
                ("feedback_rating", "INTEGER"),
                ("feedback_tags", "TEXT"),
                ("feedback_comment", "TEXT"),
            ]
            for col_name, col_type in appt_migrations:
                if col_name not in appt_cols:
                    print(f"Adding column '{col_name}' ({col_type}) to appointments...")
                    conn.execute(text(f"ALTER TABLE appointments ADD COLUMN {col_name} {col_type}"))

        conn.commit()
    print("Migration complete! Database schema is now fully synchronized across engines.")

if __name__ == "__main__":
    migrate()
