import { supabase } from '../supabaseClient'
import { AuthError, Provider, User } from '@supabase/supabase-js'

// 이메일/비밀번호로 회원가입
export async function signUp(email: string, password: string, userData?: { name?: string, contact?: string }) {
  // 1. Auth 회원가입
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw error
  
  // 2. users 테이블에 데이터 추가
  if (data.user) {
    //createUserProfile 함수 호출-users 테이블에 데이터 추가
    await createUserProfile(data.user.id, {
      email,
      name: userData?.name,
      contact: userData?.contact,
      provider: 'email'
    })
  }
  
  return data
}

// 이메일/비밀번호로 로그인
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// 소셜 로그인 (구글, 카카오 등)
export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  })
  
  if (error) throw error
  return data
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 현재 로그인한 사용자 정보 가져오기
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  
  if (error) throw error
  return data.user
}

// 비밀번호 재설정 이메일 발송
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  
  if (error) throw error
  return data
}

// users 테이블에 사용자 프로필 생성/업데이트
export async function createUserProfile(
  user_id: string, 
  userData: { 
    email: string, 
    name?: string, 
    contact?: string,
    provider: string 
  }
) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      user_id,
      email: userData.email,
      name: userData.name || null,
      contact: userData.contact || null,
      provider: userData.provider
    })
    .select()
  
  if (error) throw error
  return data
}

// 사용자 정보 업데이트
export async function updateUserProfile(userData: { name?: string, contact?: string }) {
  const user = await getCurrentUser() //auth에서 정보 가져오기기
  
  if (!user) throw new AuthError('User not authenticated')
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      user_id: user.id,
      ...userData
    })
    .select()
  
  if (error) throw error
  return data
}

// 사용자 프로필 조회
export async function getUserProfile() {
  const user = await getCurrentUser()
  
  if (!user) throw new AuthError('User not authenticated')
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116는 결과가 없음을 의미
  
  return data
}

// 소셜 로그인 후 사용자 정보가 users 테이블에 있는지 확인
export async function checkUserProfileExists(user_id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user_id)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  
  // 데이터가 없거나 이름과 연락처가 없는 경우 false 반환
  return !!(data && (data.name || data.contact))
} 