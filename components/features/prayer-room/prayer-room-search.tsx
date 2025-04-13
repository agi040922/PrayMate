"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { searchPrayerRoomsByName, searchPrayerRoomById, joinPrayerRoomBySearch } from "@/lib/supabase/prayer-rooms"
import { useAuth } from "@/lib/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  room_id: string
  title: string
  description?: string
  is_public: boolean
  created_by: string
  created_at?: string
}

interface PrayerRoomSearchProps {
  onJoin?: (roomId: string) => void
}

export function PrayerRoomSearch({ onJoin }: PrayerRoomSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"name" | "id">("name")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isJoining, setIsJoining] = useState<string | null>(null)
  
  const { toast } = useToast()
  const { user } = useAuth()
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "검색어 필요",
        description: "검색어를 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    
    setIsSearching(true)
    setShowResults(true)
    
    try {
      if (searchType === "name") {
        // 이름으로 검색
        const results = await searchPrayerRoomsByName(searchTerm)
        setSearchResults(results || [])
      } else {
        // ID로 검색
        const result = await searchPrayerRoomById(searchTerm)
        if (result) {
          setSearchResults([result])
        } else {
          setSearchResults([])
        }
      }
    } catch (error: any) {
      console.error("기도방 검색 오류:", error)
      toast({
        title: "검색 오류",
        description: error.message || "기도방 검색 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleJoin = async (roomId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "기도방에 참여하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }
    
    setIsJoining(roomId)
    
    try {
      const result = await joinPrayerRoomBySearch({
        room_id: roomId,
        user_id: user.id
      })
      
      if (result.alreadyJoined) {
        toast({
          title: "이미 참여 중",
          description: "이미 해당 기도방에 참여하고 있습니다.",
        })
      } else {
        toast({
          title: "기도방 참여 완료",
          description: "성공적으로 기도방에 참여했습니다.",
        })
      }
      
      // 목록 업데이트 또는 화면 새로고침을 위한 콜백 실행
      if (onJoin) {
        onJoin(roomId)
      }
      
      // 검색 결과 초기화
      setSearchResults([])
      setShowResults(false)
      setSearchTerm("")
      
    } catch (error: any) {
      console.error("기도방 참여 오류:", error)
      toast({
        title: "참여 오류",
        description: error.message || "기도방 참여 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(null)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant={searchType === "name" ? "default" : "outline"}
              onClick={() => setSearchType("name")}
              className="text-xs px-2"
            >
              이름 검색
            </Button>
            <Button 
              size="sm" 
              variant={searchType === "id" ? "default" : "outline"}
              onClick={() => setSearchType("id")}
              className="text-xs px-2"
            >
              코드 검색
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={searchType === "name" ? "기도방 이름 검색..." : "기도방 코드 입력..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Spinner className="mr-2 h-4 w-4" /> : null}
            검색
          </Button>
        </div>
      </div>
      
      {/* 검색 결과 */}
      {showResults && (
        <div className="space-y-2 mt-2">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((room) => (
                <Card key={room.room_id} className="p-2">
                  <CardContent className="p-2 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{room.title}</div>
                        {room.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {room.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={room.is_public ? "default" : "outline"}>
                        {room.is_public ? "공개" : "비공개"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleJoin(room.room_id)}
                      disabled={!!isJoining}
                    >
                      {isJoining === room.room_id ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          참여 중...
                        </>
                      ) : (
                        "참여하기"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground py-2">
              검색 결과가 없습니다
            </p>
          )}
        </div>
      )}
    </div>
  )
} 