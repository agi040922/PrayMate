# Supabase 이메일 인증 설정 가이드

## Supabase 프로젝트에서 이메일 인증 리다이렉트 설정 방법

1. Supabase 대시보드에 로그인합니다.
2. 프로젝트를 선택합니다.
3. 왼쪽 메뉴에서 'Authentication' > 'URL Configuration'으로 이동합니다.
4. 'Site URL'에는 사이트 기본 URL을 입력합니다. (예: `https://yourdomain.com`)
5. 'Redirect URLs'에는 인증 완료 후 리다이렉트될 URL을 등록합니다.
   - 이메일 인증 후 리다이렉트: `https://yourdomain.com/email-verified`

## Supabase Auth 리다이렉트 URL 예시

```
https://yourdomain.com/email-verified 
```

## 주의사항

- 로컬 개발 환경에서 테스트하려면 `http://localhost:3000/email-verified`와 같이 로컬 URL도 추가해야 합니다.
- 프로덕션과 개발 환경 모두에 대한 URL을 추가하는 것이 좋습니다.
- 사용자 정의 이메일 템플릿을 설정하여 더 사용자 친화적인 경험을 제공할 수 있습니다. 
  ('Authentication' > 'Email Templates' 메뉴에서 설정)

## 이메일 템플릿 내에서 리다이렉트 URL 사용 예시

이메일 템플릿에서 확인 버튼 URL을 수정할 때는 다음과 같이 설정할 수 있습니다:

```html
<a href="{{ .ConfirmationURL }}" style="/* 스타일 정의 */">이메일 인증하기</a>
```

Supabase는 자동으로 `{{ .ConfirmationURL }}` 변수를 적절한 인증 URL로 대체합니다. 