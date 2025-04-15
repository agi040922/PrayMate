"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { 
  getUserPrayerRequests, 
  getUserParticipatingRoomPrayerRequests,
  getPrayerRequestDetails,
  getPrayerAnswers,
  getComments,
  getReactions,
  PrayerRequest,
  PrayerAnswer,
  Comment,
  Reaction,
  Category
} from '../supabase/prayer-requests'
import { getUserRooms } from '../supabase/prayer-rooms'
import { getPersonalPrayerNotesForPeriod } from '../supabase/personal-prayer-notes'
import { getCategories } from '../supabase/prayer-requests'

// 응답된 기도제목의 확장 타입 (응답 내용 포함)
interface AnsweredPrayerRequest extends PrayerRequest {
  answers?: PrayerAnswer[]
  comments?: Comment[]
  reactions?: Reaction[]
  user?: {
    name: string
    email: string
  }
  categories?: {
    category_id: number
    name: string
  }
}

interface ProfileContextType {
  userPrayerRequests: PrayerRequest[]
  answeredPrayerRequests: AnsweredPrayerRequest[]
  loadingPrayerRequests: boolean
  userRooms: any[]
  loadingRooms: boolean
  weeklyPrayers: any[]
  monthlyPrayers: any[]
  yearlyPrayers: any[]
  loadingPeriodPrayers: boolean
  categories: Category[]
  loadingCategories: boolean
  selectedRoomId: string | null
  setSelectedRoomId: (id: string | null) => void
  refreshPrayerRequests: () => Promise<void>
  refreshRooms: () => Promise<void>
  refreshPeriodPrayers: () => Promise<void>
}

export const ProfileContext = createContext<ProfileContextType>({
  userPrayerRequests: [],
  answeredPrayerRequests: [],
  loadingPrayerRequests: false,
  userRooms: [],
  loadingRooms: false,
  weeklyPrayers: [],
  monthlyPrayers: [],
  yearlyPrayers: [],
  loadingPeriodPrayers: false,
  categories: [],
  loadingCategories: false,
  selectedRoomId: null,
  setSelectedRoomId: () => {},
  refreshPrayerRequests: async () => {},
  refreshRooms: async () => {},
  refreshPeriodPrayers: async () => {}
})

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  
  const [userPrayerRequests, setUserPrayerRequests] = useState<PrayerRequest[]>([])
  const [answeredPrayerRequests, setAnsweredPrayerRequests] = useState<AnsweredPrayerRequest[]>([])
  const [loadingPrayerRequests, setLoadingPrayerRequests] = useState(false)
  
  const [userRooms, setUserRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  
  const [weeklyPrayers, setWeeklyPrayers] = useState<any[]>([])
  const [monthlyPrayers, setMonthlyPrayers] = useState<any[]>([])
  const [yearlyPrayers, setYearlyPrayers] = useState<any[]>([])
  const [loadingPeriodPrayers, setLoadingPeriodPrayers] = useState(false)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  
  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error)
    } finally {
      setLoadingCategories(false)
    }
  }
  
  // 응답된 기도 요청의 상세 데이터 불러오기 (응답, 댓글, 반응 등)
  const fetchAnsweredPrayerRequestDetails = async (requests: PrayerRequest[]) => {
    if (!requests || requests.length === 0) return []
    
    // 각 응답된 기도제목의 상세 정보 불러오기
    const detailedRequests = await Promise.all(
      requests.map(async (request) => {
        try {
          // 기도 응답 데이터 불러오기
          const answers = await getPrayerAnswers(request.request_id)
          
          // 댓글 데이터 불러오기 
          const comments = await getComments(request.request_id)
          
          // 반응 데이터 불러오기
          const reactions = await getReactions(request.request_id)
          
          return {
            ...request,
            answers,
            comments,
            reactions
          }
        } catch (error) {
          console.error(`기도제목 ${request.request_id} 상세 정보 불러오기 실패:`, error)
          return request as AnsweredPrayerRequest
        }
      })
    )
    
    return detailedRequests
  }
  
  // 사용자 기도 요청 목록 불러오기
  const fetchPrayerRequests = async () => {
    if (!user) return
    
    setLoadingPrayerRequests(true)
    try {
      // 모든 기도 요청
      const requests = await getUserPrayerRequests(user.id, {
        limit: 50,
        room_id: selectedRoomId || undefined
      })
      setUserPrayerRequests(requests.filter((req: any) => !req.is_answered))
      
      // 응답된 기도 요청
      const answeredRequests = await getUserPrayerRequests(user.id, {
        is_answered: true,
        limit: 50,
        room_id: selectedRoomId || undefined
      })
      
      // 응답된 기도제목의 상세 정보 불러오기
      const detailedAnsweredRequests = await fetchAnsweredPrayerRequestDetails(answeredRequests)
      setAnsweredPrayerRequests(detailedAnsweredRequests)
    } catch (error) {
      console.error('기도 요청 불러오기 실패:', error)
    } finally {
      setLoadingPrayerRequests(false)
    }
  }
  
  // 사용자 기도방 목록 불러오기
  const fetchUserRooms = async () => {
    if (!user) return
    
    setLoadingRooms(true)
    try {
      const rooms = await getUserRooms(user.id)
      setUserRooms(rooms)
    } catch (error) {
      console.error('기도방 불러오기 실패:', error)
    } finally {
      setLoadingRooms(false)
    }
  }
  
  // 기간별 기도제목 불러오기
  const fetchPeriodPrayers = async () => {
    if (!user) return
    
    setLoadingPeriodPrayers(true)
    try {
      // 주간 기도제목
      const weekly = await getPersonalPrayerNotesForPeriod(user.id, 'weekly')
      setWeeklyPrayers(weekly)
      
      // 월간 기도제목
      const monthly = await getPersonalPrayerNotesForPeriod(user.id, 'monthly')
      setMonthlyPrayers(monthly)
      
      // 연간 기도제목
      const yearly = await getPersonalPrayerNotesForPeriod(user.id, 'yearly')
      setYearlyPrayers(yearly)
    } catch (error) {
      console.error('기간별 기도제목 불러오기 실패:', error)
    } finally {
      setLoadingPeriodPrayers(false)
    }
  }
  
  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      fetchPrayerRequests()
      fetchUserRooms()
      fetchPeriodPrayers()
      fetchCategories()
    }
  }, [user])
  
  // 선택된 기도방이 변경되면 기도제목 다시 불러오기
  useEffect(() => {
    if (user) {
      fetchPrayerRequests()
    }
  }, [selectedRoomId, user])
  
  const value = {
    userPrayerRequests,
    answeredPrayerRequests,
    loadingPrayerRequests,
    userRooms,
    loadingRooms,
    weeklyPrayers,
    monthlyPrayers,
    yearlyPrayers,
    loadingPeriodPrayers,
    categories,
    loadingCategories,
    selectedRoomId,
    setSelectedRoomId,
    refreshPrayerRequests: fetchPrayerRequests,
    refreshRooms: fetchUserRooms,
    refreshPeriodPrayers: fetchPeriodPrayers
  }
  
  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext) 