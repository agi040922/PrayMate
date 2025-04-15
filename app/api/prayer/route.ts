import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (서버 측에서만 실행됨)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // NEXT_PUBLIC_ 접두사 없는 서버 환경변수
});

// API 요청 핸들러
export async function POST(req: Request) {
  try {
    // 요청 데이터 파싱
    const { action, content } = await req.json();
    
    // 공통 시스템 메시지
    const baseSystemMessage = '당신은 기독교 신앙에 기반한 기도제목 작성을 돕는 AI 도우미입니다. 성경 구절과 기독교 용어에 익숙하며, 경건하고 존중하는 태도로 답변합니다.';
    
    // 제목 다듬기
    if (action === 'refine-title') {
      const prompt = `다음 기도제목 제목을 더 간결하고 명확하게 다듬어주세요. 기독교적 관점에서 적절한 표현을 사용해 주세요:
      
      "${content}"
      
      다듬어진 제목만 반환해주세요. 추가 설명이나 따옴표는 포함하지 마세요.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: baseSystemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      return NextResponse.json({ 
        result: response.choices[0]?.message?.content || '제목 다듬기에 실패했습니다.' 
      });
    }
    
    // 내용 다듬기
    if (action === 'refine-content') {
      const prompt = `다음 기도제목 내용을 더 명확하고 간결하게 정리해주세요. 기독교적 관점에서 적절한 표현을 사용하고, 기도하는 마음이 잘 드러나도록 해주세요:
      
      "${content}"
      
      다듬어진 내용만 반환해주세요. 추가 설명이나 따옴표는 포함하지 마세요.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: baseSystemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });
      
      return NextResponse.json({ 
        result: response.choices[0]?.message?.content || '내용 다듬기에 실패했습니다.' 
      });
    }
    
    // 성경 구절 추천
    if (action === 'suggest-verses') {
      const systemMessage = `
        당신은 기독교 신앙에 기반한 기도제목에 관련된 성경 구절을 추천하는 AI 도우미입니다. 
        사용자의 기도제목을 분석하여 3개의 가장 적절한 성경 구절을 추천해주세요.
        응답은 다음 JSON 형식으로 정확히 반환해주세요:
        {
          "verses": [
            {
              "reference": "요한복음 3:16",
              "text": "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니...",
              "relevance": "하나님의 사랑과 구원에 관한 말씀"
            },
            ...
          ]
        }
      `;
      
      const prompt = `다음 기도제목과 관련된 성경 구절 3개를 추천해주세요. 각 구절이 이 기도제목과 어떻게, 왜 연관되는지 짧게 설명해주세요 하지만 위로적이고 친절하게:
      
      "${content}"`;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });
        
        const jsonString = response.choices[0]?.message?.content || '{"verses":[]}';
        const data = JSON.parse(jsonString);
        
        return NextResponse.json(data);
      } catch (apiError) {
        // API 오류 시 기본 응답 사용
        console.error("OpenAI API 오류:", apiError);
        
        return NextResponse.json({
          verses: [
            {
              reference: "요한복음 3:16",
              text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
              relevance: "하나님의 사랑과 구원에 관한 말씀"
            },
            {
              reference: "시편 23:1",
              text: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
              relevance: "하나님의 보호와 공급에 관한 말씀"
            },
            {
              reference: "빌립보서 4:13",
              text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
              relevance: "하나님이 주시는 힘과 용기에 관한 말씀"
            }
          ]
        });
      }
    }
    
    // 잘못된 액션 요청
    return NextResponse.json(
      { error: '지원하지 않는 액션입니다.' }, 
      { status: 400 }
    );
  } catch (error: any) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: error.message || 'API 처리 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 