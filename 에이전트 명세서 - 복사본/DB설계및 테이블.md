CREATE TABLE users (
user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255),
provider VARCHAR(50), -- kakao, google 등 OAuth
name VARCHAR(100),
contact VARCHAR(20),
created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE prayer_rooms (
room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
title VARCHAR(100) NOT NULL,
description TEXT,
is_public BOOLEAN DEFAULT FALSE,
created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE room_participants (
participant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
room_id UUID REFERENCES prayer_rooms(room_id) ON DELETE CASCADE,
user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
role VARCHAR(20) DEFAULT 'member', -- admin, member
joined_at TIMESTAMP DEFAULT now(),
UNIQUE(room_id, user_id)
);

CREATE TABLE categories (
category_id SERIAL PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL,
description TEXT
);

CREATE TABLE prayer_requests (
request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
room_id UUID REFERENCES prayer_rooms(room_id) ON DELETE CASCADE,
category_id INT REFERENCES categories(category_id),
user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
bible_verse VARCHAR(50),
title VARCHAR(100) NOT NULL,
content TEXT NOT NULL,
is_answered BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT now()
);

- - 예시 데이터
INSERT INTO categories (name, description) VALUES
('개인', '개인적인 기도제목'),
('공동체', '공동체를 위한 기도제목'),
('감사', '감사한 내용을 담은 기도제목'),
('중보기도', '타인을 위한 중보기도');

CREATE TABLE comments (
comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
request_id UUID REFERENCES prayer_requests(request_id) ON DELETE CASCADE,
user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
content TEXT NOT NULL,
created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE reactions (
reaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
request_id UUID REFERENCES prayer_requests(request_id) ON DELETE CASCADE,
user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
reaction_type VARCHAR(20), -- praying, answered, support 등
created_at TIMESTAMP DEFAULT now(),
UNIQUE(request_id, user_id, reaction_type)
);

CREATE TABLE prayer_answers (
answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
request_id UUID REFERENCES prayer_requests(request_id) ON DELETE CASCADE,
content TEXT,
answered_at TIMESTAMP DEFAULT now()
);

ALTER TABLE prayer_requests ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;

CREATE TABLE bible_verses (
verse_id SERIAL PRIMARY KEY,
book VARCHAR(20) NOT NULL,
chapter INT NOT NULL,
verse_start INT NOT NULL,
verse_end INT,
content TEXT NOT NULL
);

CREATE TABLE notification_settings (
  setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE NOT NULL, -- user_id는 고유해야 함
  comment_notification BOOLEAN DEFAULT TRUE,
  prayer_notification BOOLEAN DEFAULT TRUE,
  answer_notification BOOLEAN DEFAULT TRUE,
  invite_notification BOOLEAN DEFAULT TRUE,
  system_notification BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE activity_logs (
log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(user_id),
activity_type VARCHAR(50), -- view_request, add_comment, react_request 등
request_id UUID REFERENCES prayer_requests(request_id),
room_id UUID REFERENCES prayer_rooms(room_id),
activity_timestamp TIMESTAMP DEFAULT now()
);

CREATE TABLE personal_prayer_notes (
note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
period_type VARCHAR(10) CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
period_label VARCHAR(20), -- 예: '2025-W15', '2025-04', '2025'
content TEXT NOT NULL,
is_completed BOOLEAN DEFAULT FALSE
created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE room_participants
ADD CONSTRAINT chk_role CHECK (role IN ('admin', 'member'));

CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('comment', 'prayer', 'answer', 'invite', 'system')),
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  request_id UUID REFERENCES prayer_requests(request_id) ON DELETE SET NULL,
  room_id UUID REFERENCES prayer_rooms(room_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);