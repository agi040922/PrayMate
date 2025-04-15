import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"

// 기도방 타입 정의
export interface PrayerRoom {
  room_id: string
  title: string
  description?: string
  is_public: boolean
  created_by: string
  created_at?: string
}

// 기도방 참여자 타입 정의
export interface RoomParticipant {
  participant_id: string
  room_id: string
  user_id: string
  role: "admin" | "member"
  joined_at?: string
}

/**
 * 새 기도방 생성
 */
export async function createPrayerRoom(data: {
  title: string
  description?: string
  is_public: boolean
  created_by: string
}) {
  const { title, description, is_public, created_by } = data
  
  // 1. 기도방 생성
  const { data: roomData, error: roomError } = await supabase
    .from("prayer_rooms")
    .insert({
      title,
      description,
      is_public,
      created_by
    })
    .select("*")
    .single()
  
  if (roomError) throw roomError
  
  // 2. 생성자를 관리자(admin)로 추가
  await supabase
    .from("room_participants")
    .insert({
      room_id: roomData.room_id,
      user_id: created_by,
      role: "admin"
    })
  
  return roomData
}

/**
 * 사용자가 속한 기도방 목록 조회 (사용자가 참여 중인 기도방)
 * 수정: 기도방의 전체 정보를 반환하도록 변경
 */
export async function getUserPrayerRooms(userId: string) {
  const { data, error } = await supabase
    .from("room_participants")
    .select(`
      participant_id,
      role,
      joined_at,
      prayer_rooms (
        room_id,
        title,
        description,
        is_public,
        created_by,
        created_at
      )
    `)
    .eq("user_id", userId)
  
  if (error) throw error
  
  // 필요한 형식으로 데이터 변환
  return data.map(item => ({
    room_id: item.prayer_rooms.room_id,
    title: item.prayer_rooms.title,
    description: item.prayer_rooms.description,
    is_public: item.prayer_rooms.is_public,
    created_by: item.prayer_rooms.created_by,
    created_at: item.prayer_rooms.created_at,
    role: item.role, // 추가 필드: 역할 정보 (admin 또는 member)
    participant_id: item.participant_id,
    joined_at: item.joined_at
  })) as PrayerRoom[]
}

/**
 * 공개 기도방 목록 조회
 */
export async function getPublicPrayerRooms() {
  const { data, error } = await supabase
    .from("prayer_rooms")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * 특정 기도방 상세 정보 조회
 */
export async function getPrayerRoomDetails(roomId: string) {
  const { data, error } = await supabase
    .from("prayer_rooms")
    .select("*")
    .eq("room_id", roomId)
    .single()
  
  if (error) throw error
  return data
}

/**
 * 기도방 정보 업데이트
 */
export async function updatePrayerRoom(
  roomId: string, 
  data: { title?: string; description?: string; is_public?: boolean }
) {
  const { data: roomData, error } = await supabase
    .from("prayer_rooms")
    .update(data)
    .eq("room_id", roomId)
    .select("*")
    .single()
  
  if (error) throw error
  return roomData
}

/**
 * 기도방 삭제
 */
export async function deletePrayerRoom(roomId: string) {
  // room_participants는 CASCADE 옵션 때문에 자동 삭제됩니다
  const { error } = await supabase
    .from("prayer_rooms")
    .delete()
    .eq("room_id", roomId)
  
  if (error) throw error
  return true
}

/**
 * 기도방 참여자 목록 조회
 */
export async function getRoomParticipants(roomId: string) {
  const { data, error } = await supabase
    .from("room_participants")
    .select(`
      participant_id,
      role,
      joined_at,
      users (
        user_id,
        name,
        email
      )
    `)
    .eq("room_id", roomId)
  
  if (error) throw error
  
  // 데이터 형식 변환
  return data.map(item => ({
    participant_id: item.participant_id,
    role: item.role,
    joined_at: item.joined_at,
    user: item.users
  }))
}

/**
 * 참여자 추가 (초대)
 */
export async function addRoomParticipant(data: {
  room_id: string
  user_id: string
  role?: "admin" | "member"
}) {
  const { room_id, user_id, role = "member" } = data
  
  const { data: participant, error } = await supabase
    .from("room_participants")
    .insert({
      room_id,
      user_id,
      role
    })
    .select("*")
    .single()
  
  if (error) throw error
  return participant
}

/**
 * 참여자 역할 변경
 */
export async function updateParticipantRole(participantId: string, role: "admin" | "member") {
  const { data, error } = await supabase
    .from("room_participants")
    .update({ role })
    .eq("participant_id", participantId)
    .select("*")
    .single()
  
  if (error) throw error
  return data
}

/**
 * 참여자 제거
 */
export async function removeRoomParticipant(participantId: string) {
  const { error } = await supabase
    .from("room_participants")
    .delete()
    .eq("participant_id", participantId)
  
  if (error) throw error
  return true
}

/**
 * 기도방 참여 여부 확인
 */
export async function checkRoomParticipation(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single()
  
  if (error && error.code === "PGRST116") {
    // PGRST116는 결과가 없음을 의미
    return null
  }
  
  if (error) throw error
  return data
}

/**
 * 기도방에 사용자가 관리자인지 확인
 */
export async function isRoomAdmin(roomId: string, userId: string) {
  const participant = await checkRoomParticipation(roomId, userId)
  return participant?.role === "admin"
}

/**
 * 기도방 참여 (사용자가 기도방에 참여)
 */
export async function joinPrayerRoom(data: {
  room_id: string
  user_id: string
  role?: "admin" | "member"
}) {
  const { room_id, user_id, role = "member" } = data
  
  // 이미 참여 중인지 확인
  const { data: existingParticipant, error: checkError } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", room_id)
    .eq("user_id", user_id)
    .single()
    
  // 이미 참여 중이면 기존 참여 정보 반환
  if (!checkError && existingParticipant) {
    return existingParticipant
  }
  
  // 새로 참여 처리
  const { data: participant, error } = await supabase
    .from("room_participants")
    .insert({
      room_id,
      user_id,
      role
    })
    .select("*")
    .single()
  
  if (error) throw error
  return participant
}

/**
 * 기도방 이름으로 검색
 */
export async function searchPrayerRoomsByName(searchTerm: string) {
  // 검색어가 없거나 너무 짧은 경우 처리
  if (!searchTerm || searchTerm.trim().length < 1) {
    return [];
  }
  
  try {
    const sanitizedTerm = searchTerm.trim().replace(/[%_]/g, ''); // SQL 인젝션 방지를 위한 기본 처리
    
    const { data, error } = await supabase
      .from("prayer_rooms")
      .select("*")
      .ilike("title", `%${sanitizedTerm}%`)
      .eq("is_public", true)
      .limit(20);
    
    if (error) {
      console.error("기도방 이름 검색 오류:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("기도방 이름 검색 예외:", error);
    return [];
  }
}

/**
 * 특정 기도방 ID로 검색
 */
export async function searchPrayerRoomById(roomId: string) {
  // 유효하지 않은 ID 처리
  if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
    return null;
  }
  
  try {
    const sanitizedId = roomId.trim();
    
    const { data, error } = await supabase
      .from("prayer_rooms")
      .select("*")
      .eq("room_id", sanitizedId)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        // 결과가 없는 경우
        return null;
      }
      console.error("기도방 ID 검색 오류:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("기도방 ID 검색 예외:", error);
    return null;
  }
}

/**
 * 검색 결과를 바탕으로 기도방 참여
 */
export async function joinPrayerRoomBySearch(data: {
  room_id: string
  user_id: string
}) {
  const { room_id, user_id } = data
  
  // 1. 먼저 기도방이 존재하는지 확인
  const { data: roomData, error: roomError } = await supabase
    .from("prayer_rooms")
    .select("*")
    .eq("room_id", room_id)
    .single()
  
  if (roomError) throw roomError
  
  // 2. 이미 참여 중인지 확인
  const { data: existingParticipant, error: checkError } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", room_id)
    .eq("user_id", user_id)
    .single()
    
  // 이미 참여 중이면 참여 중임을 알림
  if (!checkError && existingParticipant) {
    return { 
      alreadyJoined: true, 
      roomData,
      participantData: existingParticipant
    }
  }
  
  // 3. 참여 처리
  const { data: participant, error } = await supabase
    .from("room_participants")
    .insert({
      room_id,
      user_id,
      role: "member" // 검색으로 참여하는 사용자는 기본적으로 member 권한
    })
    .select("*")
    .single()
  
  if (error) throw error
  
  return { 
    alreadyJoined: false, 
    roomData,
    participantData: participant
  }
}

/**
 * 사용자가 참여 중인 기도방 목록 조회
 */
export async function getUserRooms(userId: string) {
  const { data, error } = await supabase
    .from('room_participants')
    .select(`
      participant_id,
      role,
      joined_at,
      prayer_rooms (
        room_id,
        title, 
        description,
        is_public,
        created_by,
        created_at
      )
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  
  // 중첩된 구조 풀어서 반환
  return data.map((item) => ({
    participant_id: item.participant_id,
    role: item.role,
    joined_at: item.joined_at,
    ...item.prayer_rooms
  }))
}

/**
 * 기도방 나가기
 * @param roomId 기도방 ID
 * @param userId 나가려는 사용자 ID
 * @returns 성공 시 { success: true }, 에러 발생 시 에러 throw
 */
export async function leavePrayerRoom(roomId: string, userId: string) {
  try {
    // 1. 해당 방의 참여자 목록 조회
    const { data: participants, error: participantsError } = await supabase
      .from("room_participants")
      .select("participant_id, user_id, role")
      .eq("room_id", roomId)
    
    if (participantsError) throw participantsError
    
    // 2. 현재 참여자가 마지막 한 명인지 확인
    if (participants.length === 1 && participants[0].user_id === userId) {
      // 마지막 한 명이면 방 자체를 삭제
      await deletePrayerRoom(roomId)
      return { success: true, action: "room_deleted" }
    }
    
    // 3. 현재 사용자의 participant_id 찾기
    const currentParticipant = participants.find(p => p.user_id === userId)
    if (!currentParticipant) throw new Error("사용자가 이 방에 참여하고 있지 않습니다.")
    
    // 4. 현재 사용자가 관리자인지 확인
    if (currentParticipant.role === "admin") {
      // 4-1. 다른 관리자가 있는지 확인
      const otherAdmins = participants.filter(p => 
        p.role === "admin" && p.user_id !== userId
      )
      
      // 4-2. 다른 관리자가 없다면 랜덤으로 한 명에게 관리자 권한 부여
      if (otherAdmins.length === 0) {
        // 자신 외의 다른 참여자들
        const otherParticipants = participants.filter(p => p.user_id !== userId)
        
        // 랜덤으로 한 명 선택 (첫 번째 참여자로 변경)
        const newAdmin = otherParticipants[0]
        
        // 새 관리자로 업데이트
        await updateParticipantRole(newAdmin.participant_id, "admin")
      }
    }
    
    // 5. 현재 사용자 참여 정보 삭제
    const { error: removeError } = await supabase
      .from("room_participants")
      .delete()
      .eq("participant_id", currentParticipant.participant_id)
    
    if (removeError) throw removeError
    
    return { success: true, action: "left_room" }
  } catch (error) {
    console.error("기도방 나가기 오류:", error)
    throw error
  }
}