-- StudyPlan Table
CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('cycle', 'schedule')),
    exam_date TEXT,
    days_until_exam INTEGER,
    total_hours REAL NOT NULL DEFAULT 0,
    focus_areas TEXT, -- JSON array
    intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
    methodology TEXT CHECK (methodology IN ('pomodoro', 'timeboxing', 'custom')),
    weekly_hour_limit REAL,
    data TEXT, -- JSON data
    cycle_data TEXT, -- JSON array
    weekly_data TEXT, -- JSON array
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- StudySubject Table
CREATE TABLE IF NOT EXISTS study_subjects (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    color TEXT,
    priority INTEGER DEFAULT 0,
    last_studied TEXT,
    total_time REAL DEFAULT 0,
    custom_subject BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE
);

-- StudyTopic Table
CREATE TABLE IF NOT EXISTS study_topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    completed BOOLEAN DEFAULT FALSE,
    last_studied TEXT,
    total_time REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (subject_id) REFERENCES study_subjects(id) ON DELETE CASCADE
);

-- StudySubtopic Table
CREATE TABLE IF NOT EXISTS study_subtopics (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    name TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    completed BOOLEAN DEFAULT FALSE,
    last_studied TEXT,
    total_time REAL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (topic_id) REFERENCES study_topics(id) ON DELETE CASCADE
);

-- StudySession Table
CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    topic TEXT,
    subtopic TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    performance TEXT CHECK (performance IN ('low', 'medium', 'high')),
    task_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- SavedPlan Table (for multiple plans management)
CREATE TABLE IF NOT EXISTS saved_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (plan_id) REFERENCES study_plans(id) ON DELETE CASCADE
);

-- DailyLog Table
CREATE TABLE IF NOT EXISTS daily_logs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON data
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_subjects_plan_id ON study_subjects(plan_id);
CREATE INDEX IF NOT EXISTS idx_study_topics_subject_id ON study_topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_subtopics_topic_id ON study_subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_saved_plans_is_active ON saved_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

-- Triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_study_plans_updated_at 
    AFTER UPDATE ON study_plans
BEGIN
    UPDATE study_plans SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_study_subjects_updated_at 
    AFTER UPDATE ON study_subjects
BEGIN
    UPDATE study_subjects SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_study_topics_updated_at 
    AFTER UPDATE ON study_topics
BEGIN
    UPDATE study_topics SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_study_subtopics_updated_at 
    AFTER UPDATE ON study_subtopics
BEGIN
    UPDATE study_subtopics SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_study_sessions_updated_at 
    AFTER UPDATE ON study_sessions
BEGIN
    UPDATE study_sessions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_saved_plans_updated_at 
    AFTER UPDATE ON saved_plans
BEGIN
    UPDATE saved_plans SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_daily_logs_updated_at 
    AFTER UPDATE ON daily_logs
BEGIN
    UPDATE daily_logs SET updated_at = datetime('now') WHERE id = NEW.id;
END;