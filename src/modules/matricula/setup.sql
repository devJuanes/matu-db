-- ============================================================
-- MatuDB — Matrícula Module Setup
-- Run this SQL in your project's SQL Editor:
--   Dashboard → Your Project → SQL Editor → Paste & Run
-- ============================================================

CREATE TABLE IF NOT EXISTS estudiantes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT        NOT NULL,
  cedula       TEXT        UNIQUE NOT NULL,
  correo       TEXT        UNIQUE NOT NULL,
  telefono     TEXT,
  edad         INTEGER     CHECK(edad >= 16 AND edad <= 100),
  carrera      TEXT        NOT NULL,
  semestre     INTEGER     DEFAULT 1 CHECK(semestre >= 1 AND semestre <= 12),
  activo       BOOLEAN     DEFAULT TRUE,
  foto_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- If the table already exists, add foto_url if not present:
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'estudiantes'
ORDER BY ordinal_position;
