const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

app.use(cors()); // Permite todas as origens

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'work.0102',
    database: 'projeto_documentos'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados');
});

// Inicie o servidor escutando em todas as interfaces de rede
app.listen(3000, '0.0.0.0', function () {
    console.log('Listening to port:  ' + 3000);
});

app.post('/cadastro', (req, res) => {
    const { nome, sobrenome, setor, email, senha } = req.body;
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';

    // Verifique se o e-mail já existe
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Se o e-mail já existir, retorne uma resposta adequada
            res.status(400).send('E-mail já cadastrado');
        } else {
            const insertQuery = 'INSERT INTO usuarios (nome, sobrenome, setor, email, senha) VALUES (?, ?, ?, ?, ?)';
            // Se o e-mail não existir, insira o novo usuário
            db.query(insertQuery, [nome, sobrenome, setor, email, senha], (err, result) => {
                if (err) throw err;
                res.send('Usuário cadastrado com sucesso');
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';

    // Execute a consulta SQL
    db.query(query, [email, senha], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Retorne também o nome e sobrenome do usuário
            res.json({
                message: 'Login bem-sucedido',
                nome: results[0].nome,
                sobrenome: results[0].sobrenome,
                setor: results[0].setor
            });
        } else {
            res.status(401).send('Email ou senha inválidos');
        }
    });
});

app.get('/ultimoNumero', (req, res) => {
    const query = 'SELECT nome, ultimo_numero FROM usuarios ORDER BY ultimo_numero DESC LIMIT 1';

    db.query(query, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send(results[0]);
        } else {
            res.status(404).send('Nenhum usuário encontrado');
        }
    });
});

app.post('/usuarioInfo', (req, res) => {
    const { email } = req.body;

    const query = `SELECT nome, sobrenome, setor FROM usuarios WHERE email = ?`;

    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Erro ao recuperar informações do usuário:', err);
            res.status(500).json({ error: 'Erro ao recuperar informações do usuário' });
            return;
        }

        if (result.length > 0) {
            // Se encontrar o usuário, envie os dados como resposta
            res.json(result[0]);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    });
});

app.get('/getMemorando', (req, res) => {
    db.query('SELECT memorando FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.get('/getMemorandoCircular', (req, res) => {
    db.query('SELECT memorandoCircular FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.get('/getOficio', (req, res) => {
    db.query('SELECT oficio FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.get('/getOficioCircular', (req, res) => {
    db.query('SELECT oficioCircular FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.get('/getAtestado', (req, res) => {
    db.query('SELECT atestado FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.get('/getdeclaracao', (req, res) => {
    db.query('SELECT declaracao FROM documentos', (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

app.post('/adquirirMemorando', (req, res) => {
    let sql = 'UPDATE documentos SET memorando = memorando + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT memorando FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                // Obtenha o nome e sobrenome do usuário
                const query = 'SELECT nome, sobrenome FROM usuarios WHERE email = ?';
                db.query(query, [req.body.email], (err, userResults) => {
                    if (err) throw err;
                    res.json({
                        memorando: results[0].memorando,
                        nome: userResults[0].nome,
                        sobrenome: userResults[0].sobrenome,
                        dataHora: new Date(),
                        tipoDocumento: 'Memorando'
                    });
                });
            } else {
                db.query('INSERT INTO documentos (memorando) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ memorando: 1 });
                });
            }
        });
    });
});

app.post('/adquirirMemorandoCircular', (req, res) => {
    let sql = 'UPDATE documentos SET memorandoCircular = memorandoCircular + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT memorandoCircular FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                db.query('INSERT INTO documentos (memorandoCircular) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ memorandoCircular: 1 });
                });
            }
        });
    });
});

app.post('/adquirirOficio', (req, res) => {
    let sql = 'UPDATE documentos SET oficio = oficio + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT oficio FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                db.query('INSERT INTO documentos (oficio) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ oficio: 1 });
                });
            }
        });
    });
});

app.post('/adquirirOficioCircular', (req, res) => {
    let sql = 'UPDATE documentos SET oficioCircular = oficioCircular + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT oficioCircular FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                db.query('INSERT INTO documentos (oficioCircular) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ oficioCircular: 1 });
                });
            }
        });
    });
});

app.post('/adquiriratestado', (req, res) => {
    let sql = 'UPDATE documentos SET atestado = atestado + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT atestado FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                db.query('INSERT INTO documentos (atestado) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ atestado: 1 });
                });
            }
        });
    });
});

app.post('/adquirirdeclaracao', (req, res) => {
    let sql = 'UPDATE documentos SET declaracao = declaracao + 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT declaracao FROM documentos', (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                db.query('INSERT INTO documentos (declaracao) VALUES (1)', (err, result) => {
                    if (err) throw err;
                    res.json({ declaracao: 1 });
                });
            }
        });
    });
});

app.post('/diminuirMemorando', (req, res) => {
    let sql = 'UPDATE documentos SET memorando = memorando - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT memorando FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.post('/diminuirMemorandoCircular', (req, res) => {
    let sql = 'UPDATE documentos SET memorandoCircular = memorandoCircular - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT memorandoCircular FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.post('/diminuirOficio', (req, res) => {
    let sql = 'UPDATE documentos SET oficio = oficio - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT oficio FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.post('/diminuirOficioCircular', (req, res) => {
    let sql = 'UPDATE documentos SET oficioCircular = oficioCircular - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT oficioCircular FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.post('/diminuiratestado', (req, res) => {
    let sql = 'UPDATE documentos SET atestado = atestado - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT atestado FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.post('/diminuirdeclaracao', (req, res) => {
    let sql = 'UPDATE documentos SET declaracao = declaracao - 1';
    db.query(sql, (err, result) => {
        if (err) throw err;
        db.query('SELECT declaracao FROM documentos', (err, results) => {
            if (err) throw err;
            res.json(results[0]);
        });
    });
});

app.get('/getUsers', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.delete('/deleteUser/:email', (req, res) => {
    console.log(req.params.email); // Verifique o email
    db.query('DELETE FROM usuarios WHERE email = ?', [req.params.email], (err, result) => {
        if (err) {
            console.log(err); // Registre o erro
            throw err;
        }
        console.log(result); // Verifique o resultado
        res.json({ message: 'Usuário deletado com sucesso' });
    });
});

app.post('/updateLastUser', (req, res) => {
    const { email, buttonType } = req.body;
    const query = 'UPDATE last_user_table SET email = ? WHERE button_type = ?';
    db.query(query, [email, buttonType], (err, results) => {
        if (err) throw err;
        res.send('Último usuário atualizado com sucesso');
    });
});

app.post('/storeDocumentoUsuario', (req, res) => {
    const { email, documentoTipo, documentoNumero } = req.body;
    const query = 'INSERT INTO usuarios_documentos (usuario_email, documento_tipo, documento_numero) VALUES (?, ?, ?)';
    db.query(query, [email, documentoTipo, documentoNumero], (err, result) => {
      if (err) {
        console.error('Erro ao inserir dados no banco de dados:', err);
        res.status(500).json({ error: 'Erro ao inserir dados no banco de dados' });
        return;
      }
    });
});

app.get('/usuarios', (req, res) => {
    const query = 'SELECT usuario_email, documento_tipo, documento_numero FROM usuarios_documentos ORDER BY data_insercao DESC LIMIT 5';
  
    db.query(query, (error, results) => {
      if (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
        return;
      }
      res.json(results);
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));