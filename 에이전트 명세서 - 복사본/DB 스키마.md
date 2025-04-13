1.Room 생성 시 ‘room_participants’ 동기화

방(Prayer Rooms)을 만들면, 생성자(또는 관리자)는 반드시 room_participants 테이블에 해당 room_id와 user_id로 “admin” 역할이 들어가야 한다.

이를 자동으로 처리하려면 트랜잭션 내에서 방 생성 → room_participants 등록을 한꺼번에 실행하거나, 애플리케이션 계층에서 로직을 짜서 방 생성 후 room_participants에 등록하도록 해야 한다.

2.Role(관리자) 양도/추가 처리

Admin 권한 양도 시에도 room_participants의 role을 업데이트해야 하며, 만약 한 명만 admin이어야 한다면, 트랜잭션으로 "새로운 Admin 등록 → 기존 Admin을 Member로 수정" 같은 순서가 필요하다.

3.