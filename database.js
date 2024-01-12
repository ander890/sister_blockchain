const sqlite3 = require('sqlite3').verbose();
const dbFile = __dirname + "/storage/blockchain-pilpres.db";

let db = new sqlite3.Database(dbFile, sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
    // runQueries(db);
});

function createDatabase() {
    db = new sqlite3.Database(dbFile, (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
        createTables();
    });
}

async function createTables(){
    let migration1 = `CREATE TABLE IF NOT EXISTS paslon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            no_urut INTEGER(11),
            capres VARCHAR(255),
            cawapres VARCHAR(255)
        );
    `

    db.run(migration1, (err) => {
        if(err) throw err

        let migration2 = `INSERT INTO paslon (id, no_urut, capres, cawapres)
        VALUES (1, 1, 'Anies Baswedan', 'Abdul Muhaimin Iskandar'),
        (2, 2, 'Prabowo Subianto', 'Gibran Rakabuming Raka'),
        (3, 3, 'Ganjar Pranowo', 'Mahfud MD');
        `

        db.run(migration2, (err) => {
            if(err) throw err
        })
    })


    let migration3 = `CREATE TABLE IF NOT EXISTS voters(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nik VARCHAR(255),
        nama_ibu_kandung VARCHAR(255),
        is_voted INTEGER(11)
    );
    `

    db.run(migration3, (err) => {
        if(err) throw err

        let migration4 = `INSERT INTO voters (id, nik, nama_ibu_kandung, is_voted)
        VALUES (1, '3374121709030003', 'Ratih Evawani', 0);`

        db.run(migration4, (err) => {
            if(err) throw err
        })
    })
}


module.exports = db;