-- Ember · Diary Cabinet
-- Setup SQL for Supabase

-- 日记表（一天一篇，不可修改不可删除）
CREATE TABLE IF NOT EXISTS ember_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  time_of_day TEXT NOT NULL DEFAULT 'morning'
    CHECK (time_of_day IN ('dawn','morning','afternoon','dusk','night','latenight')),
  body TEXT NOT NULL,
  word_of_day TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 批注表（Iris 写的旁注）
CREATE TABLE IF NOT EXISTS ember_annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES ember_entries(id),
  quote TEXT NOT NULL,
  quote_start INTEGER NOT NULL DEFAULT 0,
  quote_end INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ember_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ember_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON ember_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ember_annotations FOR ALL USING (true) WITH CHECK (true);

-- 索引
CREATE INDEX idx_ember_entries_date ON ember_entries (entry_date DESC);
CREATE INDEX idx_ember_annotations_entry ON ember_annotations (entry_id);
