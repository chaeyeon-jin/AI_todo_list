# 📝 Full Stack Todo App

React + Express로 구축한 풀스택 할일 관리 애플리케이션입니다.

## ✨ 주요 기능

- ✅ 할일 추가, 수정, 삭제
- ✅ 완료 상태 토글
- ✅ 전체/완료/진행중 필터링
- ✅ 전체 완료/전체 삭제 기능
- ✅ 실시간 통계 (전체/완료/남은 일)
- ✅ 서버 기반 데이터 저장 (다중 브라우저 공유 가능)

## 🛠️ 기술 스택

### Frontend
- React 18 (CDN)
- Tailwind CSS
- Babel Standalone

### Backend
- Node.js
- Express
- CORS

## 📦 설치 방법

### 1. 저장소 클론
```bash
cd w4_assignment
```

### 2. 의존성 설치
```bash
npm install
```

또는 수동으로:
```bash
npm init -y
npm install express cors
```

## 🚀 실행 방법

### 1. 백엔드 서버 실행
```bash
node todo_api.js
```
서버가 `http://localhost:3002`에서 실행됩니다.

### 2. 프론트엔드 실행
- VSCode Live Server 사용:
  - `index.html` 우클릭 → "Open with Live Server"
  - `http://localhost:5500/index.html`에서 접속

- 또는 다른 웹 서버 사용:
  ```bash
  # Python 3
  python -m http.server 8000
  
  # Node.js (http-server)
  npx http-server
  ```

⚠️ **중요**: `file://` 프로토콜로는 CORS 정책 때문에 API 호출이 불가능합니다. 반드시 웹 서버를 사용하세요.

## 📡 API 명세

### Base URL
```
http://localhost:3002/api/todos
```

### 엔드포인트

#### 1. 전체 조회
```http
GET /api/todos
```

**응답 예시:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "text": "할일 1", "completed": false },
    { "id": 2, "text": "할일 2", "completed": true }
  ]
}
```

#### 2. 새 항목 추가
```http
POST /api/todos
Content-Type: application/json

{
  "text": "새로운 할일"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Todo가 생성되었습니다",
  "data": { "id": 4, "text": "새로운 할일", "completed": false }
}
```

#### 3. 항목 수정
```http
PUT /api/todos/:id
Content-Type: application/json

{
  "completed": true,
  "text": "수정된 텍스트"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": { "id": 1, "text": "수정된 텍스트", "completed": true }
}
```

#### 4. 항목 삭제
```http
DELETE /api/todos/:id
```

**응답:** `204 No Content`

### HTTP 상태 코드

- `200` OK - 성공
- `201` Created - 생성 성공
- `204` No Content - 삭제 성공
- `400` Bad Request - 잘못된 요청
- `404` Not Found - 리소스를 찾을 수 없음

## 🧪 테스트 방법

### 1. API 테스트 (Thunder Client, Postman 등)
```bash
# 전체 조회
GET http://localhost:3002/api/todos

# 추가
POST http://localhost:3002/api/todos
Body: {"text": "테스트 할일"}

# 수정
PUT http://localhost:3002/api/todos/1
Body: {"completed": true}

# 삭제
DELETE http://localhost:3002/api/todos/1
```

### 2. 브라우저 콘솔에서 테스트
```javascript
// 전체 조회
fetch('http://localhost:3002/api/todos')
  .then(r => r.json())
  .then(console.log);

// 추가
fetch('http://localhost:3002/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '테스트' })
}).then(r => r.json()).then(console.log);
```

### 3. 다중 브라우저 테스트
1. Chrome과 Firefox를 동시에 실행
2. 양쪽 모두 `http://localhost:5500/index.html` 접속
3. 한쪽에서 할일 추가/수정/삭제
4. 다른 쪽 새로고침 → 데이터가 공유됨! 🎉

## 📂 프로젝트 구조

```
w4_assignment/
├── index.html          # React 프론트엔드
├── todo_api.js         # Express 백엔드 API
├── package.json        # 프로젝트 의존성
├── node_modules/       # 설치된 패키지
└── README.md          # 프로젝트 문서
```

## 🎨 UI 특징

- 반응형 디자인 (모바일/데스크톱)
- Tailwind CSS 스타일링
- Dongle 폰트 사용
- 직관적인 색상 구분:
  - 파란색: 전체
  - 분홍색: 완료
  - 노란색: 진행중

## ⚠️ 주의사항

- 현재 데이터는 **메모리에 저장**되므로 서버 재시작 시 초기화됩니다
- 프로덕션 환경에서는 데이터베이스(MongoDB, PostgreSQL 등) 사용을 권장합니다
- CORS가 모든 출처(`*`)를 허용하고 있으므로 실제 배포 시 보안 설정이 필요합니다

## 🔮 향후 개선사항

- [ ] MongoDB 연동으로 영구 저장
- [ ] 사용자 인증 (회원가입/로그인)
- [ ] 할일 카테고리/태그 기능
- [ ] 마감일 설정
- [ ] 우선순위 기능
- [ ] 검색 기능

## 📄 라이선스

MIT License

## 👤 작성자

채연

---

**문의사항이나 버그 발견 시 이슈를 남겨주세요!**

