/**
 * Todo REST API 서버
 * Express + SQLite 기반 Todo 관리 API
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3002;

// 미들웨어
app.use(cors());
app.use(express.json());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
  } else {
    console.log('✅ SQLite 데이터베이스 연결 성공');
  }
});

// 테이블 생성 (없을 경우에만)
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error('❌ 테이블 생성 실패:', err.message);
  } else {
    // 초기 데이터 확인 및 삽입
    db.get('SELECT COUNT(*) as count FROM todos', (err, row) => {
      if (!err && row.count === 0) {
        const initialTodos = [
          'Express 서버 만들기',
          'React와 연결하기',
          'Full Stack 개발자 되기'
        ];
        
        const stmt = db.prepare('INSERT INTO todos (text, completed) VALUES (?, ?)');
        initialTodos.forEach(text => {
          stmt.run(text, 0);
        });
        stmt.finalize();
        console.log('✅ 초기 데이터 삽입 완료');
      }
    });
  }
});

// GET /api/todos - 전체 조회
app.get('/api/todos', (req, res) => {
  console.log('📋 GET /api/todos - 전체 조회');

  db.all('SELECT * FROM todos ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회 실패'
      });
    }

    // completed를 boolean으로 변환
    const todos = rows.map(row => ({
      id: row.id,
      text: row.text,
      completed: row.completed === 1
    }));

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
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

  const trimmedText = text.trim();

  db.run(
    'INSERT INTO todos (text, completed) VALUES (?, ?)',
    [trimmedText, 0],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: '데이터 추가 실패'
        });
      }

      const newTodo = {
        id: this.lastID,
        text: trimmedText,
        completed: false
      };

      console.log(`✅ POST /api/todos - 새 Todo 생성: "${newTodo.text}"`);

      res.status(201).json({
        success: true,
        message: 'Todo가 생성되었습니다',
        data: newTodo
      });
    }
  );
});

// PUT /api/todos/:id - 항목 수정
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // 먼저 Todo가 존재하는지 확인
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회 실패'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // 업데이트할 필드 준비
    let updateFields = [];
    let updateValues = [];

    if (req.body.completed !== undefined) {
      updateFields.push('completed = ?');
      updateValues.push(req.body.completed ? 1 : 0);
    }

    if (req.body.text !== undefined && req.body.text.trim() !== '') {
      updateFields.push('text = ?');
      updateValues.push(req.body.text.trim());
    }

    if (updateFields.length === 0) {
      // 업데이트할 내용이 없으면 기존 데이터 반환
      return res.json({
        success: true,
        data: {
          id: row.id,
          text: row.text,
          completed: row.completed === 1
        }
      });
    }

    updateValues.push(id);

    const query = `UPDATE todos SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(query, updateValues, function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: '데이터 수정 실패'
        });
      }

      // 수정된 데이터 조회
      db.get('SELECT * FROM todos WHERE id = ?', [id], (err, updatedRow) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: '수정된 데이터 조회 실패'
          });
        }

        const updatedTodo = {
          id: updatedRow.id,
          text: updatedRow.text,
          completed: updatedRow.completed === 1
        };

        console.log(`✏️ PUT /api/todos/${id} - Todo 수정: "${updatedTodo.text}"`);

        res.json({ success: true, data: updatedTodo });
      });
    });
  });
});

// DELETE /api/todos/:id - 항목 삭제
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // 먼저 Todo가 존재하는지 확인
  db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회 실패'
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    db.run('DELETE FROM todos WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: '데이터 삭제 실패'
        });
      }

      console.log(`🗑️ DELETE /api/todos/${id} - Todo 삭제: "${row.text}"`);

      res.status(204).send();
    });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Todo API 서버 실행!');
  console.log('='.repeat(60));
  console.log(`\n📍 서버 주소: http://localhost:${PORT}`);
  console.log('💾 데이터베이스: SQLite (todos.db)');
  console.log('✅ API 엔드포인트:');
  console.log('   GET    /api/todos     - 전체 조회');
  console.log('   POST   /api/todos     - 새 항목 추가');
  console.log('   PUT    /api/todos/:id - 항목 수정');
  console.log('   DELETE /api/todos/:id - 항목 삭제\n');
  console.log('종료: Ctrl + C\n');
  console.log('='.repeat(60));
});

// 서버 종료 시 데이터베이스 연결 종료
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('❌ 데이터베이스 종료 실패:', err.message);
    } else {
      console.log('\n✅ 데이터베이스 연결 종료');
    }
    process.exit(0);
  });
});
