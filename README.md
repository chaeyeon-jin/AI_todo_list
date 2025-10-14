# 📝 Full Stack Todo App

React + Express + Supabase로 구축한 풀스택 할일 관리 애플리케이션입니다.

## ✨ 주요 기능

- ✅ 할일 추가, 수정, 삭제
- ✅ 완료 상태 토글
- ✅ 전체/완료/진행중 필터링
- ✅ 전체 완료/전체 삭제 기능
- ✅ 실시간 통계 (전체/완료/남은 일)
- ✅ Supabase (PostgreSQL) 기반 클라우드 데이터 저장
- ✅ 다중 브라우저 데이터 공유
- ✅ 확장 가능한 백엔드 아키텍처

## 🛠️ 기술 스택

### Frontend
- React 18 (CDN)
- Tailwind CSS
- Babel Standalone

### Backend
- Node.js
- Express
- Supabase (PostgreSQL)
- CORS

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/chaeyeon-jin/fullstack_todo_list.git
cd fullstack_todo_list
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Supabase 프로젝트 설정

#### 3.1 Supabase 계정 생성
1. [Supabase](https://supabase.com) 방문
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. 프로젝트 생성:
   - Name: `fullstack-todo-app`
   - Database Password: 안전한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택
   - 생성 대기 (약 2분)

#### 3.2 테이블 생성
Supabase Dashboard → SQL Editor → New query

```sql
-- todos 테이블 생성
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 데이터 삽입
INSERT INTO todos (text, completed) VALUES
  ('Express 서버 만들기', false),
  ('React와 연결하기', false),
  ('Full Stack 개발자 되기', false);
```

#### 3.3 API 키 확인
Settings → API → Project API keys에서:
- `Project URL` 복사
- `service_role` 키 복사

### 4. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

⚠️ **중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

## 🚀 실행 방법

### 1. 백엔드 서버 실행
```bash
npm start
```
또는:
```bash
node todo_api.js
```

서버가 `http://localhost:3002`에서 실행됩니다.

### 2. 프론트엔드 실행
- **VSCode Live Server 사용** (권장):
  - `index.html` 우클릭 → "Open with Live Server"
  - `http://localhost:5500/index.html`에서 접속

- **다른 웹 서버 사용**:
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
    { "id": 1, "text": "할일 1", "completed": false, "created_at": "2025-10-14T..." },
    { "id": 2, "text": "할일 2", "completed": true, "created_at": "2025-10-14T..." }
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
  "data": { "id": 4, "text": "새로운 할일", "completed": false, "created_at": "..." }
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
  "data": { "id": 1, "text": "수정된 텍스트", "completed": true, "created_at": "..." }
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
- `500` Internal Server Error - 서버 오류

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
fullstack_todo_list/
├── index.html          # React 프론트엔드
├── todo_api.js         # Express 백엔드 API
├── .env                # 환경 변수 (Git 제외)
├── .env.example        # 환경 변수 예시
├── package.json        # 프로젝트 의존성
├── node_modules/       # 설치된 패키지
├── .gitignore          # Git 제외 파일
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

- 데이터는 **Supabase 클라우드 PostgreSQL**에 저장됩니다
- `.env` 파일은 절대 Git에 커밋하지 마세요 (보안 이슈)
- `service_role` 키는 서버에서만 사용하세요 (프론트엔드 노출 금지)
- Supabase 무료 플랜:
  - 프로젝트 2개
  - 500MB 데이터베이스
  - 월 50만 건 API 요청
- 프로덕션 배포 시 CORS 설정 수정 권장

## 🚀 배포 방법 (Vercel)

### 1. Vercel 설치
```bash
npm install -g vercel
```

### 2. 배포
```bash
vercel
```

### 3. 환경 변수 설정
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
```

### 4. 프로덕션 배포
```bash
vercel --prod
```

## 🔮 향후 개선사항

- [x] ~~SQLite 연동으로 영구 저장~~ ✅ 완료
- [x] ~~Supabase 클라우드 DB 마이그레이션~~ ✅ 완료
- [ ] 실시간 구독 (다른 브라우저 자동 동기화)
- [ ] 사용자 인증 (회원가입/로그인)
- [ ] 할일 카테고리/태그 기능
- [ ] 마감일 설정
- [ ] 우선순위 기능
- [ ] 검색 기능
- [ ] 드래그 앤 드롭 정렬

## 📊 마이그레이션 히스토리

1. **v1.0** - In-memory 배열 (초기 버전)
2. **v2.0** - SQLite 로컬 DB
3. **v3.0** - Supabase 클라우드 DB (현재) ✅

## 📄 라이선스

MIT License

## 👤 작성자

진채연

---

**문의사항이나 버그 발견 시 이슈를 남겨주세요!**
