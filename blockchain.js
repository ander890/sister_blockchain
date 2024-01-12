const SHA256 = require('crypto-js/sha256')
const fs = require('fs');

class Block{
    constructor(data, timestamp, previousHash = ''){
        this.data = data
        this.timestamp = timestamp
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash(){
        return SHA256(JSON.stringify(this.data) + this.timestamp + this.previousHash + this.nonce).toString()
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) != Array(difficulty+1).join("0")){
            this.nonce++
            this.hash = this.calculateHash()
        }

        console.log("Block mined : " + this.hash)
    }
}

function calculateHash(data, timestamp, previousHash, nonce){
    return SHA256(JSON.stringify(data) + timestamp + previousHash + nonce).toString()
}

class Blockchain{
    constructor(){
        if (fs.existsSync('./storage/pilpres-chain.json')) {
            this.chain = JSON.parse(fs.readFileSync('./storage/pilpres-chain.json', 'utf-8'))
        }else{
            this.chain = [
                this.createGenesisBlock()
            ]
        }

        this.difficulty = 4
    }

    saveChain(){
        fs.writeFileSync('./storage/pilpres-chain.json', JSON.stringify(this.chain, null, 4));
    }

    createGenesisBlock(){
        return new Block("Genesis block", "01/01/2024", "0")
    }

    getChain(){
        return this.chain
    }

    searchChain(q){
        let c = this.chain

        for (let i = 0; i < c.length; i++) {
            if(c[i]?.data?.product?.serialNumber == q){
                return c[i]
            }
        }

        return {
            error: "Not Found"
        }
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mineBlock(this.difficulty)

        this.chain.push(newBlock)

        this.saveChain()
    }

    isChainValid(){
        for(let i = 1;i < this.chain.length;i++){
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i-1]

            if(currentBlock.hash != calculateHash(currentBlock.data, currentBlock.timestamp, currentBlock.previousHash, currentBlock.nonce)){
                return false
            }

            if(previousBlock.hash != currentBlock.previousHash){
                return false
            }

        }

        return true
    }
}

module.exports = { Block, Blockchain }