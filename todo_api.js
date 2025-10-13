/**
 * Todo REST API 서버
 * Express 기반 Todo 관리 API
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors());
app.use(express.json());

// 데이터 저장소 (in-memory)
let todos = [
  { id: 1, text: 'Express 서버 만들기', completed: false },
  { id: 2, text: 'React와 연결하기', completed: false },
  { id: 3, text: 'Full Stack 개발자 되기', completed: false }
];

let nextId = 4;

// GET /api/todos - 전체 조회
app.get('/api/todos', (req, res) => {
  console.log('📋 GET /api/todos - 전체 조회');

  res.json({
    success: true,
    count: todos.length,
    data: todos
  });
});

// POST /api/todos - 새 항목 추가
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'text 필드는 필수입니다'
    });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(newTodo);

  console.log(`✅ POST /api/todos - 새 Todo 생성: "${newTodo.text}"`);

  res.status(201).json({
    success: true,
    message: 'Todo가 생성되었습니다',
    data: newTodo
  });
});

// PUT /api/todos/:id - 항목 수정
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  
  if (!todo) {
    return res.status(404).json({ 
      success: false,
      error: 'Todo not found' 
    });
  }
  
  // completed나 text 업데이트
  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }
  if (req.body.text !== undefined && req.body.text.trim() !== '') {
    todo.text = req.body.text.trim();
  }
  
  console.log(`✏️ PUT /api/todos/${id} - Todo 수정: "${todo.text}"`);
  
  res.json({ success: true, data: todo });
});

// DELETE /api/todos/:id - 항목 삭제
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Todo not found' 
    });
  }
  
  const deletedTodo = todos[index];
  todos.splice(index, 1);
  
  console.log(`🗑️ DELETE /api/todos/${id} - Todo 삭제: "${deletedTodo.text}"`);
  
  res.status(204).send();
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo API 서버 실행!');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('📋 초기 Todos:', todos.length, '개');
  console.log('✅ API 엔드포인트:');
  console.log('   GET    /api/todos     - 전체 조회');
  console.log('   POST   /api/todos     - 새 항목 추가');
  console.log('   PUT    /api/todos/:id - 항목 수정');
  console.log('   DELETE /api/todos/:id - 항목 삭제\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});
