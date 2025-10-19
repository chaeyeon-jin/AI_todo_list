/**
 * Todo REST API 서버
 * Express + Supabase 기반 Todo 관리 API
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors());
app.use(express.json());

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('✅ Supabase 연결 설정 완료');
console.log('✅ Gemini AI 초기화 완료');

// GET /api/todos - 전체 조회
app.get('/api/todos', async (req, res) => {
  console.log('📋 GET /api/todos - 전체 조회');

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('조회 실패:', error);
      return res.status(500).json({
        success: false,
        error: '데이터 조회 실패'
      });
    }

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    console.error('서버 에러:', err);
    res.status(500).json({
      success: false,
      error: '서버 에러'
    });
  }
});

// POST /api/todos - 새 항목 추가
app.post('/api/todos', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'text 필드는 필수입니다'
    });
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ 
        text: text.trim(), 
        completed: false 
      }])
      .select()
      .single();

    if (error) {
      console.error('추가 실패:', error);
      return res.status(500).json({
        success: false,
        error: '데이터 추가 실패'
      });
    }

    console.log(`✅ POST /api/todos - 새 Todo 생성: "${data.text}"`);

    res.status(201).json({
      success: true,
      message: 'Todo가 생성되었습니다',
      data: data
    });
  } catch (err) {
    console.error('서버 에러:', err);
    res.status(500).json({
      success: false,
      error: '서버 에러'
    });
  }
});

// PUT /api/todos/:id - 항목 수정
app.put('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // 업데이트할 필드 준비
    const updates = {};

    if (req.body.completed !== undefined) {
      updates.completed = req.body.completed;
    }

    if (req.body.text !== undefined && req.body.text.trim() !== '') {
      updates.text = req.body.text.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: '업데이트할 내용이 없습니다'
      });
    }

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('수정 실패:', error);
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    console.log(`✏️ PUT /api/todos/${id} - Todo 수정: "${data.text}"`);

    res.json({ 
      success: true, 
      data: data 
    });
  } catch (err) {
    console.error('서버 에러:', err);
    res.status(500).json({
      success: false,
      error: '서버 에러'
    });
  }
});

// DELETE /api/todos/:id - 항목 삭제
app.delete('/api/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // 먼저 삭제할 Todo 조회 (로그용)
    const { data: todo, error: selectError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();

    if (selectError) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // 삭제 실행
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('삭제 실패:', deleteError);
      return res.status(500).json({
        success: false,
        error: '데이터 삭제 실패'
      });
    }

    console.log(`🗑️ DELETE /api/todos/${id} - Todo 삭제: "${todo.text}"`);

    res.status(204).send();
  } catch (err) {
    console.error('서버 에러:', err);
    res.status(500).json({
      success: false,
      error: '서버 에러'
    });
  }
});

// POST /api/ai/generate-todos - AI로 할일 생성
app.post('/api/ai/generate-todos', async (req, res) => {
  const { goal } = req.body;

  if (!goal || goal.trim() === '') {
    return res.status(400).json({
      success: false,
      error: '목표를 입력해주세요'
    });
  }

  try {
    console.log(`🤖 AI 요청: "${goal}"`);

    // Gemini 모델 사용 (gemini-2.0-flash-exp - 최신 실험 모델, 무료)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `당신은 목표를 실행 가능한 작은 할일(Todo)로 쪼개는 전문가입니다.

사용자의 목표: "${goal}"

위 목표를 달성하기 위한 구체적이고 실행 가능한 할일 목록을 3~5개로 나눠주세요.

규칙:
1. 각 할일은 명확하고 구체적이어야 합니다
2. 실행 가능한 작은 단계로 나눠야 합니다
3. 순서대로 정렬해주세요
4. 각 할일은 한 문장으로 작성합니다
5. 반드시 3개 이상 5개 이하로 작성합니다

응답 형식: 각 줄마다 하나의 할일만 작성하고, 번호나 특수문자 없이 순수한 텍스트만 출력하세요.

예시 입력: "영어 회화 실력 향상하기"
예시 출력:
영어 학습 앱 다운로드하고 학습 계획 세우기
매일 10분씩 영어 팟캐스트 듣기
일주일에 3번 영어 일기 쓰기
온라인 영어 회화 수업 등록하기
영어로 말하는 연습을 위해 언어 교환 파트너 찾기`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 응답을 줄 단위로 나누고 빈 줄 제거
    const todos = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.match(/^[\d\.\-\*]+\s/)) // 번호나 불릿 포인트 제거
      .slice(0, 5); // 최대 5개

    console.log(`✅ AI 생성 완료: ${todos.length}개의 할일`);

    res.json({
      success: true,
      todos: todos,
      count: todos.length
    });
  } catch (err) {
    console.error('AI 생성 실패:', err);
    res.status(500).json({
      success: false,
      error: 'AI 처리 중 오류가 발생했습니다: ' + err.message
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo API 서버 실행!');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('💾 데이터베이스: Supabase (PostgreSQL)');
  console.log('🤖 AI: Google Gemini');
  console.log('✅ API 엔드포인트:');
  console.log('   GET    /api/todos              - 전체 조회');
  console.log('   POST   /api/todos              - 새 항목 추가');
  console.log('   PUT    /api/todos/:id          - 항목 수정');
  console.log('   DELETE /api/todos/:id          - 항목 삭제');
  console.log('   POST   /api/ai/generate-todos  - AI로 할일 생성\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ 서버 종료');
  process.exit(0);
});
