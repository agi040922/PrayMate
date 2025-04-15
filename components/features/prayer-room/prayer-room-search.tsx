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
      let results: SearchResult[] = [];
      
      if (searchType === "name") {
        // 이름으로 검색
        try {
          const nameResults = await searchPrayerRoomsByName(searchTerm);
          results = nameResults || [];
        } catch (error) {
          console.error("이름 검색 오류:", error);
          results = [];
        }
      } else {
        // ID로 검색 - 특수문자나 유효하지 않은 ID 처리
        if (!/^[a-zA-Z0-9-_]+$/.test(searchTerm)) {
          toast({
            title: "유효하지 않은 기도방 코드",
            description: "기도방 코드는 영문, 숫자, 하이픈(-), 언더스코어(_)만 포함할 수 있습니다.",
            variant: "destructive",
          });
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        
        try {
          const result = await searchPrayerRoomById(searchTerm);
          results = result ? [result] : [];
        } catch (error) {
          console.error("ID 검색 오류:", error);
          results = [];
        }
      }
      
      setSearchResults(results);
      
      // 결과가 없는 경우 메시지 표시
      if (results.length === 0) {
        toast({
          title: "검색 결과 없음",
          description: searchType === "name" 
            ? "입력한 이름과 일치하는 기도방을 찾을 수 없습니다." 
            : "입력한 코드와 일치하는 기도방을 찾을 수 없습니다.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("기도방 검색 오류:", error);
      toast({
        title: "검색 오류",
        description: "기도방 검색 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
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
// 1. Supabase 검색 기능 추가
// /lib/supabase/prayer-rooms.ts 파일에 다음 기능들을 추가했습니다:
// 기도방 이름으로 검색 (searchPrayerRoomsByName): 기도방 제목에 특정 텍스트가 포함된 기도방을 찾습니다. 대소문자를 구분하지 않는 부분 일치 검색을 제공합니다.
// 기도방 ID로 검색 (searchPrayerRoomById): 정확한 기도방 ID를 사용하여 특정 기도방을 찾습니다.
// 검색 결과로 기도방 참여 (joinPrayerRoomBySearch): 검색 결과에서 찾은 기도방에 사용자를 참여시키는 기능입니다. 이미 참여 중인지 확인하고 적절한 응답을 반환합니다.

// 2. 기도방 검색 컴포넌트 생성
// /components/features/prayer-room/prayer-room-search.tsx 파일을 생성하여 검색 UI를 구현했습니다:
// 이름 검색과 코드(ID) 검색 사이를 전환할 수 있는 탭 버튼
// 검색어 입력 필드와 검색 버튼
// 검색 결과 표시 영역 (기도방 제목, 설명, 공개/비공개 여부 표시)
// 각 검색 결과에 대한 "참여하기" 버튼
// 로딩 상태 표시 및 오류 처리

// 3. 사이드바에 검색 컴포넌트 통합
// /components/features/prayer-room/prayer-room-sidebar.tsx 파일을 수정하여 검색 기능을 통합했습니다:
// 제목 영역 옆에 검색 아이콘 버튼 추가
// Collapsible 컴포넌트를 사용하여 검색 UI를 접을 수 있는 형태로 구현
// 검색 결과에서 기도방 참여 시 기도방 목록을 새로고침하고 해당 기도방을 선택하는 기능
// 검색 후 참여한 기도방으로 자동 이동

// 4. Collapsible 컴포넌트 추가
// /components/ui/collapsible.tsx 파일을 생성하여 접을 수 있는 UI 컴포넌트를 추가했습니다:
// Radix UI의 Collapsible 컴포넌트를 사용하여 구현
// 애니메이션 효과를 통해 부드러운 접기/펼치기 기능 제공
// 구현된 기능 요약
// 사용자는 기도방 사이드바에서 검색 아이콘을 클릭하여 검색 패널을 열 수 있습니다.
// 이름 또는 코드로 기도방을 검색할 수 있습니다.
// 검색 결과에서 기도방을 선택하여 바로 참여할 수 있습니다.
// 참여한 기도방은 사용자의 기도방 목록에 추가되고 자동으로 선택됩니다.
// 이 구현을 통해 사용자들은 더 쉽게 기도방을 찾고 참여할 수 있게 되었습니다.
