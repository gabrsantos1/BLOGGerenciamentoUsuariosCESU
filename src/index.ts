import express, { Request, Response } from "express";
import mysql from "mysql2/promise";

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//mostra tela inicial
app.get('/', async (req: Request, res: Response) => {
    res.render('inicialScreen');
});


// mostrar users
app.get('/users', async (req: Request, res: Response) => {
    try {
        const [rows] = await connection.query("SELECT * FROM users");
        return res.render('users/index', { users: rows });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return res.status(500).send("Erro ao buscar usuários.");
    }
});

// mostrar add dos users
app.get("/users/add", (req: Request, res: Response) => {
    return res.render("users/add");
});

// salva users
app.post('/users/save', async (req: Request, res: Response) => {
    const { name, email, password, confirm_password, user_type } = req.body;

    // verifica senha e confirm
    if (password !== confirm_password) {
        return res.redirect('/users/form?errorMessage=As senhas não correspondem');
    }

    // add no banco
    const insertQuery = "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)";
    
    try {
        await connection.query(insertQuery, [name, email, password, user_type]); // Senha não está hash
        res.redirect('/users');
    } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        res.redirect('/users/form?errorMessage=Erro ao salvar usuário');
    }
});




// deleta users
app.post("/users/delete/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    try {
        await connection.query(sqlDelete, [id]);
        res.redirect("/users");
    } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        return res.status(500).send("Erro ao deletar usuário.");
    }
});

// edita users
app.get('/users/edit/:id', async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [id]);
        
        if (Array.isArray(rows) && rows.length > 0) {
            return res.render('users/edit', { user: rows[0] });
        } else {
            return res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).send('Erro ao buscar usuário');
    }
});

app.post('/users/update/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { name, email } = req.body;

    try {
        const updateQuery = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        await connection.query(updateQuery, [name, email, id]);
        res.redirect('/users'); // Redireciona de volta para a lista de usuários
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).send('Erro ao atualizar usuário');
    }
});

//tela de login
app.get('/login', (req: Request, res: Response) => {
    res.render('login'); // Renderiza a tela de login
});

//teste de login
app.post('/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email === 'admin@example.com' && password === 'senha') {
        res.redirect('/users');
    } else {
        const errorMessage = "Login sem sucesso.";
        res.redirect('/login');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
