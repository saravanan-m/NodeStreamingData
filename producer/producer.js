const express = require('express')
const fs = require('fs')
const jsonResponse = require('./sabre_6m.json')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Running healthy!')
})


app.get('/response', (req, res) => {
    res.setHeader("Content-Type", "application/json")
    res.send(jsonResponse)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})