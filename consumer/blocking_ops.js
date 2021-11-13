

function blockingOps(item) {
    let output = []

    if (item instanceof Array) {
        // itinTotalFare = item[0]['AirItineraryPricingInfo'][0]['ItinTotalFare']
        for (record of item) {
            output.push(parseItem(record))
        }
    } else {
        output.push(parseItem(item))
    }

    return output
}

function parseItem(item) {
    let baseFare = {}
    let itinTotalFare = item['AirItineraryPricingInfo'][0]['ItinTotalFare']

    if (itinTotalFare != undefined && itinTotalFare['BaseFare'] != undefined) {
        //console.log(itinTotalFare)

        //blocking operation - 10ms delay
        let currentTimeStamp = new Date().getTime()
        while (new Date().getTime() - currentTimeStamp < 10) {
            // console.log('heavy ops')
        }

        //console.log('heavy ops over '+ ((new Date().getTime()) - currentTimeStamp) +' ms')

        baseFare = itinTotalFare['BaseFare']
    }

    return baseFare
}

module.exports = blockingOps