const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root', 
    password: 'Servertester12!@',
    database: 'unicesu'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL.');
    }
});

module.exports = connection;
