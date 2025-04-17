import { supabase } from "@/lib/supabaseClient"

/**
 * 알림 타입 정의
 */
export interface Notification {
  notification_id: string
  user_id: string
  type: "comment" | "prayer" | "answer" | "invite" | "system"
  title: string
  content: string
  is_read: boolean
  sender_id?: string
  request_id?: string
  room_id?: string
  created_at?: string
  // 조인 데이터
  sender?: {
    name: string
    email: string
  }
  prayer_request?: {
    title: string
  }
  prayer_room?: {
    title: string
  }
}

/**
 * 알림 설정 타입 정의
 */
export interface NotificationSetting {
  setting_id: string
  user_id: string
  comment_notification: boolean
  prayer_notification: boolean
  answer_notification: boolean
  invite_notification: boolean
  system_notification: boolean
  updated_at?: string
}

/**
 * 사용자의 알림 목록 조회
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  }
) {
  let query = supabase
    .from("notifications")
    .select(`
      *,
      sender:sender_id (
        name,
        email
      ),
      prayer_request:request_id (
        title
      ),
      prayer_room:room_id (
        title
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  
  // 읽지 않은 알림만 필터링
  if (options?.unreadOnly) {
    query = query.eq("is_read", false)
  }
  
  // 페이지네이션
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10) - 1))
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

/**
 * 알림을 읽음 처리
 */
export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 모든 알림을 읽음 처리
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .select()
  
  if (error) throw error
  return data
}

/**
 * 알림 삭제
 */
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("notification_id", notificationId)
  
  if (error) throw error
  return true
}

/**
 * 새 알림 생성
 */
export async function createNotification(data: {
  user_id: string
  type: "comment" | "prayer" | "answer" | "invite" | "system"
  title: string
  content: string
  sender_id?: string
  request_id?: string
  room_id?: string
}) {
  // 1. 사용자의 알림 설정 확인
  const { data: settings, error: settingsError } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", data.user_id)
    .single()
  
  // 2. 알림 생성
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      content: data.content,
      sender_id: data.sender_id,
      request_id: data.request_id,
      room_id: data.room_id,
      is_read: false
    })
    .select()
    .single()
  
  if (error) throw error
  return notification
}

/**
 * 알림 카운트 조회
 */
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)
  
  if (error) throw error
  return count || 0
}

/**
 * 사용자의 알림 설정 조회
 */
export async function getUserNotificationSettings(userId: string) {
  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single()
  
  if (error) {
    // 설정이 없으면 기본 설정으로 생성
    if (error.code === "PGRST116") {
      return createUserNotificationSettings(userId)
    }
    throw error
  }
  
  return data
}

/**
 * 사용자의 알림 설정 생성
 */
export async function createUserNotificationSettings(userId: string) {
  const defaultSettings = {
    user_id: userId,
    comment_notification: true,
    prayer_notification: true,
    answer_notification: true,
    invite_notification: true,
    system_notification: true
  }
  
  const { data, error } = await supabase
    .from("notification_settings")
    .insert(defaultSettings)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 사용자의 알림 설정 업데이트
 */
export async function updateUserNotificationSettings(
  userId: string, 
  settings: Partial<Omit<NotificationSetting, 'setting_id' | 'user_id' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from("notification_settings")
    .update(settings)
    .eq("user_id", userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * 댓글 알림 생성 헬퍼 함수
 */
export async function createCommentNotification({
  recipientId,
  senderId,
  requestId,
  roomId,
  senderName,
  comment
}: {
  recipientId: string
  senderId: string
  requestId: string
  roomId: string
  senderName: string
  comment: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "comment",
    title: "새 댓글이 달렸습니다",
    content: `${senderName}님이 당신의 기도제목에 댓글을 남겼습니다: '${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}'`,
    sender_id: senderId,
    request_id: requestId,
    room_id: roomId
  })
}

/**
 * 기도 반응 알림 생성 헬퍼 함수
 */
export async function createPrayerReactionNotification({
  recipientId,
  senderId,
  requestId,
  roomId,
  senderName
}: {
  recipientId: string
  senderId: string
  requestId: string
  roomId: string
  senderName: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "prayer",
    title: "함께 기도합니다",
    content: `${senderName}님이 당신의 기도제목에 함께 기도하고 있습니다.`,
    sender_id: senderId,
    request_id: requestId,
    room_id: roomId
  })
}

/**
 * 기도 요청에 대한 '기도중' 반응 추가/제거 시 알림 생성 헬퍼 함수
 */
export async function createPrayerToggleNotification({
  recipientId,
  senderId,
  requestId,
  roomId,
  senderName,
  prayerTitle,
  isPraying
}: {
  recipientId: string
  senderId: string
  requestId: string
  roomId: string
  senderName: string
  prayerTitle: string
  isPraying: boolean
}) {
  // 기도를 시작하는 경우에만 알림 생성
  if (!isPraying) {
    return createNotification({
      user_id: recipientId,
      type: "prayer",
      title: "새로운 기도 동참",
      content: `${senderName}님이 '${prayerTitle}' 기도제목에 함께 기도하기 시작했습니다.`,
      sender_id: senderId,
      request_id: requestId,
      room_id: roomId
    });
  }
  return null; // 기도를 취소하는 경우에는 알림을 생성하지 않음
}

/**
 * 기도 응답 알림 생성 헬퍼 함수
 */
export async function createPrayerAnswerNotification({
  recipientId,
  senderId,
  requestId,
  roomId,
  senderName,
  prayerTitle
}: {
  recipientId: string
  senderId: string
  requestId: string
  roomId: string
  senderName: string
  prayerTitle: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "answer",
    title: "기도 응답이 등록되었습니다",
    content: `${senderName}님이 '${prayerTitle}' 기도제목에 응답을 기록했습니다.`,
    sender_id: senderId,
    request_id: requestId,
    room_id: roomId
  })
}

/**
 * 기도 응답 상태 변경 알림 생성 헬퍼 함수
 */
export async function createPrayerAnsweredNotification({
  recipientIds,
  senderId,
  requestId,
  roomId,
  senderName,
  prayerTitle
}: {
  recipientIds: string[] // 이 기도제목에 반응한 모든 사용자 ID
  senderId: string
  requestId: string
  roomId: string
  senderName: string
  prayerTitle: string
}) {
  const notifications = [];
  
  for (const recipientId of recipientIds) {
    if (recipientId === senderId) continue; // 자신에게는 알림 보내지 않음
    
    const notification = await createNotification({
      user_id: recipientId,
      type: "answer",
      title: "기도 응답 소식",
      content: `${senderName}님이 '${prayerTitle}' 기도제목에 응답을 받았습니다.`,
      sender_id: senderId,
      request_id: requestId,
      room_id: roomId
    });
    
    notifications.push(notification);
  }
  
  return notifications;
}

/**
 * 기도 요청 상태 변경 알림 생성 헬퍼 함수
 */
export async function createPrayerStatusChangeNotification({
  recipientId,
  senderId,
  requestId,
  roomId,
  senderName,
  prayerTitle,
  isAnswered
}: {
  recipientId: string
  senderId: string
  requestId: string
  roomId: string
  senderName: string
  prayerTitle: string
  isAnswered: boolean
}) {
  return createNotification({
    user_id: recipientId,
    type: "answer",
    title: isAnswered ? "기도 응답 확인" : "기도 요청 상태 변경",
    content: isAnswered 
      ? `${senderName}님이 '${prayerTitle}' 기도제목을 응답 받음으로 표시했습니다.`
      : `${senderName}님이 '${prayerTitle}' 기도제목의 응답 상태를 변경했습니다.`,
    sender_id: senderId,
    request_id: requestId,
    room_id: roomId
  })
}

/**
 * 기도방 초대 알림 생성 헬퍼 함수
 */
export async function createRoomInviteNotification({
  recipientId,
  senderId,
  roomId,
  senderName,
  roomTitle
}: {
  recipientId: string
  senderId: string
  roomId: string
  senderName: string
  roomTitle: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "invite",
    title: "기도방 초대",
    content: `${senderName}님이 '${roomTitle}' 기도방에 초대했습니다.`,
    sender_id: senderId,
    room_id: roomId
  })
}

/**
 * 기도방 역할 변경 알림 생성 헬퍼 함수
 */
export async function createRoleChangeNotification({
  recipientId,
  senderId,
  roomId,
  senderName,
  roomTitle,
  newRole
}: {
  recipientId: string
  senderId: string
  roomId: string
  senderName: string
  roomTitle: string
  newRole: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "system",
    title: "기도방 역할 변경",
    content: `${senderName}님이 '${roomTitle}' 기도방에서 회원님의 역할을 '${newRole === 'admin' ? '관리자' : '일반 회원'}'로 변경했습니다.`,
    sender_id: senderId,
    room_id: roomId
  })
}

/**
 * 기도방 퇴출 알림 생성 헬퍼 함수
 */
export async function createRoomRemovalNotification({
  recipientId,
  senderId,
  roomTitle,
  senderName
}: {
  recipientId: string
  senderId: string
  roomTitle: string
  senderName: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "system",
    title: "기도방 퇴출 안내",
    content: `${senderName}님이 회원님을 '${roomTitle}' 기도방에서 퇴출했습니다.`,
    sender_id: senderId
  })
}

/**
 * 기도방 삭제 알림 생성 헬퍼 함수
 */
export async function createRoomDeleteNotification({
  recipientIds,
  senderId,
  roomTitle,
  senderName
}: {
  recipientIds: string[]
  senderId: string
  roomTitle: string
  senderName: string
}) {
  const notifications = [];
  
  for (const recipientId of recipientIds) {
    if (recipientId === senderId) continue; // 자신에게는 알림 보내지 않음
    
    const notification = await createNotification({
      user_id: recipientId,
      type: "system",
      title: "기도방 삭제 안내",
      content: `${senderName}님이 '${roomTitle}' 기도방을 삭제했습니다.`,
      sender_id: senderId
    });
    
    notifications.push(notification);
  }
  
  return notifications;
}

/**
 * 시스템 알림 생성 헬퍼 함수
 */
export async function createSystemNotification({
  recipientId,
  title,
  content
}: {
  recipientId: string
  title: string
  content: string
}) {
  return createNotification({
    user_id: recipientId,
    type: "system",
    title,
    content
  })
} 