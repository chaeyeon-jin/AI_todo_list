/**
 * Todo REST API 서버
 * Express + Supabase 기반 Todo 관리 API
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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

console.log('✅ Supabase 연결 설정 완료');

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

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo API 서버 실행!');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('💾 데이터베이스: Supabase (PostgreSQL)');
  console.log('✅ API 엔드포인트:');
  console.log('   GET    /api/todos     - 전체 조회');
  console.log('   POST   /api/todos     - 새 항목 추가');
  console.log('   PUT    /api/todos/:id - 항목 수정');
  console.log('   DELETE /api/todos/:id - 항목 삭제\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ 서버 종료');
  process.exit(0);
});
