const PilpresBlockchain = require('./blockchain')
const express = require('express')
const path = require('path');
const app = express()
const port = 3050
var bodyParser = require('body-parser');
const multer  = require('multer')
const db = require('./database')


// Put these statements before you define any routes.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(multer().array())
// let blockChain = new PilpresBlockchain.Blockchain()

// console.log("Mining block 1...")
// blockChain.addBlock(new PilpresBlockchain.Block({
//     product: {
//         serialNumber: "A1230123321",
//         productName: "Ventela Yang Ayam",
//         purchaseStore: "Ventela Official Store",
//         sales: "Tokopedia",
//         purchaseDate: "01/01/2022",
//     },
//     name: "Daniel Alexander",
//     address: "Jl Citra Pesona Raya A6 Perum Citra Pesona",
//     phone: "628990727766",
// }, "04/10/2022"))

// console.log("Mining block 2...")
// blockChain.addBlock(new PilpresBlockchain.Block({
//     product: {
//         serialNumber: "A4535435656",
//         productName: "Ventela Yang Ayam",
//         purchaseStore: "Ventela Official Store",
//         sales: "Tokopedia",
//         purchaseDate: "01/01/2022",
//     },
//     name: "Daniel Alexander",
//     address: "Jl Citra Pesona Raya A6 Perum Citra Pesona",
//     phone: "628990727766",
// }, "04/10/2022"))


// console.log(JSON.stringify(blockChain, null, 4))

app.use(express.static('public'))
app.engine('html', require('ejs').renderFile);

let pilpresChain = new PilpresBlockchain.Blockchain

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/view/cek.html'));
})

app.post('/', async (req, res) => {
    try{
        const {nik, nama_ibu_kandung} = req.body


        let voter = await queryDB("SELECT * FROM voters WHERE nik = ? AND nama_ibu_kandung = ? LIMIT 1", [nik, nama_ibu_kandung])
        if(voter){
            if(voter.is_voted == 0){
                res.render(__dirname + "/view/pilih.html", voter);
            }else{
                res.render(__dirname + "/view/gagal.html", {alasan: "Sudah Melakukan Pemilihan"});
            }
        }else{
            res.render(__dirname + "/view/gagal.html", {alasan: "NIK / Nama Ibu Kandung Tidak Sesuai"});
        }
    }catch(err){
        console.log(err)
        res.render(__dirname + "/view/gagal.html");
    }

    // if(!pilpresChain.isChainValid()){
    //     return res.render(__dirname + "/view/blockchainbroke.html");
    // }

    // let search = pilpresChain.searchChain(serialNumber);

    // if(search?.error){
    //     res.render(__dirname + "/view/palsu.html", search);
    // }else{
    //     res.render(__dirname + "/view/hasil.html", search);
    // }

})

app.post('/vote', async (req, res) => {
    try{
        const {nik, nama_ibu_kandung, paslon} = req.body

        let voter = await queryDB("SELECT * FROM voters WHERE nik = ? AND nama_ibu_kandung = ? LIMIT 1", [nik, nama_ibu_kandung])
        if(voter){
            if(voter.is_voted == 0){
                let data = {
                    nik,
                    namaIbuKandung: nama_ibu_kandung,
                    pilihan: paslon
                }
                console.log("NEW DATA TO BLOCKCHAIN, TRY TO MINING")
                pilpresChain.addBlock(new PilpresBlockchain.Block(data, Date.now(), pilpresChain.getLatestBlock.hash))
                console.log("MINING SUCCESS")
                await queryDB("UPDATE voters SET is_voted = 1 WHERE nik = ? AND nama_ibu_kandung = ?", [nik, nama_ibu_kandung])
                res.render(__dirname + "/view/sukses.html");
            }else{
                res.render(__dirname + "/view/gagal.html", {alasan: "Sudah Melakukan Pemilihan"});
            }
        }else{
            res.render(__dirname + "/view/gagal.html", {alasan: "NIK / Nama Ibu Kandung Tidak Sesuai"});
        }
    }catch(err){
        console.log(err)
        res.render(__dirname + "/view/gagal.html");
    }
})

app.get('/result', (req, res) => {
    let chain = pilpresChain.getChain()

    let data = {
        total: 0,
        paslon1: 0,
        paslon2: 0,
        paslon3: 0
    }

    //COUNT CHAIN
    for (let i = 1; i < chain.length; i++) {
        const element = chain[i];
        if(element.data.pilihan == '1'){
            data.paslon1++
        }else if(element.data.pilihan == '2'){
            data.paslon2++
        }else if(element.data.pilihan == '3'){
            data.paslon3++
        }

        data.total++
    }

    data.paslon1persen = data.paslon1 != 0 ? parseFloat(((data.paslon1 / data.total) * 100).toFixed(2)) : 0
    data.paslon2persen = data.paslon2 != 0 ? parseFloat(((data.paslon2 / data.total) * 100).toFixed(2)) : 0
    data.paslon3persen = data.paslon3 != 0 ? parseFloat(((data.paslon3 / data.total) * 100).toFixed(2)) : 0
    console.log(data)

    res.render(path.join(__dirname+'/view/result.html'), data);
})

app.get('/admin', (req, res) => {
    let data = {
        month: pilpresChain.getChain().length - 1,
        year: pilpresChain.getChain().length - 1,
        total: pilpresChain.getChain().length - 1,
        pending: 0,
        isValid: pilpresChain.isChainValid(),
        chain: pilpresChain.getChain()
    }

    res.render(path.join(__dirname+'/view/index.html'), data);
})

app.get('/login', (req, res) => {
    res.render(path.join(__dirname+'/view/login.html'));
})

app.get('/transaksi', (req, res) => {
    let chain = pilpresChain.getChain()
    res.render(path.join(__dirname+'/view/transaksi.html'), { blockchain: chain });
})

app.post('/transaksi', (req, res) => {
    let data = {
        "product": {
            "serialNumber": req.body.serialNumber,
            "productName": req.body.productName,
            "purchaseStore": "ORIKU",
            "sales": "daniel@mail.com",
            "purchaseDate": req.body.purchaseDate
        },
        "name": req.body.name,
        "address": req.body.address,
        "phone": req.body.phone
    }
    pilpresChain.addBlock(new PilpresBlockchain.Block(data, Date.now(), pilpresChain.getLatestBlock.hash))

    let chain = pilpresChain.getChain()
    res.render(path.join(__dirname+'/view/transaksi.html'), { blockchain: chain });
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body 

    let user = db.get("SELECT * FROM user WHERE email = ? AND password = ? LIMIT 1", [email, password], (err, rows) => {
        console.log(rows)
    })
    res.sendFile(path.join(__dirname+'/public/login.html'));
})

// app.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname+'/public/index.html'));
// })

async function queryDB(query, value){
    let res = await new Promise((resolve,reject)=>{
        let a = db.get(query, value, (err, rows) => {
            if(err)reject(err)
            resolve(rows)
        })
    })

    return res
}

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})