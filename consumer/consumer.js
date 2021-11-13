const express = require('express')
const fs = require('fs')
const request = require('request');
const blockingOps = require('./blocking_ops');
const { Transform , pipeline, Readable} = require('stream');

const app = express()
const port = 4000

app.get('/', (req, res) => {
    res.send('Running healthy')
})

app.get('/regular-response', (req, res) => {
    request.get('http://localhost:3000/response', function (error, response, body) {
        if (error) {
            res.send(error)
            return
        }

        let parsedData = JSON.parse(body)
        let outputResponseData = []

        for (item of parsedData['OTA_AirLowFareSearchRS']['PricedItineraries']['PricedItinerary']) {
            outputResponseData.push(blockingOps(item)[0])
        }

        res.json(outputResponseData)
    });
})

app.get('/stream-response', (req, res) => {
    request.get('http://localhost:3000/response', function (error, response, body) {
        if (error) {
            res.send(error)
            return
        }

        const singleFilterTransform = new Transform({
            writableObjectMode: true,
            transform(chunk, encoding, callback) {
                let price = blockingOps(chunk)
                let dataString = JSON.stringify(price)
                
                dataString = dataString.substring(1,dataString.length)  //remove open
                dataString = dataString.substring(0,dataString.length-1)  //remove close

                if(!this.hasWritten){
                    this.push('[')
                    this.push(dataString)
                    this.hasWritten = true
                }else{
                    this.push(','+dataString)
                }
                return setImmediate(callback)
            },
            flush(callback) {
                this.push(']')
                return callback()
            }
        });
        singleFilterTransform.hasWritten = false


        pipeline(
            singleFilterTransform,
            res,
            pipelineErr => {
                if (pipelineErr) {
                    console.error('Pipeline failed', pipelineErr.message === undefined ? pipelineErr : pipelineErr.message);
                }
            }
        )

        res.setHeader("Content-Type", "application/json");
        let parsedData = JSON.parse(body)

        //console.log('array size '+ parsedData['OTA_AirLowFareSearchRS']['PricedItineraries']['PricedItinerary'].length)

        while(parsedData['OTA_AirLowFareSearchRS']['PricedItineraries']['PricedItinerary'].length){
            let item = parsedData['OTA_AirLowFareSearchRS']['PricedItineraries']['PricedItinerary'].splice(0,5)
            //console.log('item'+JSON.stringify(item))
            singleFilterTransform.write(item)
        }
        singleFilterTransform.end()

    });
})

var server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
server.timeout = 20*1000;
