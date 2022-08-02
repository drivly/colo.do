# [colo.do](https://colo.do)
Cloudflare Durable Object Proxy for specific Colo Locations to measure and monitor performance

```
{
  "visitorLatencyToWorker": 36,
  "workerLatencyToDurable": 20,
  "visitorDistanceToWorker": 551,
  "workerDistanceToDurable": 0,
  "visitorDistanceToDurable": 551,
  "workerLocation": {
    "iata": "ORD",
    "lat": 41.97859955,
    "lon": -87.90480042,
    "cca2": "US",
    "region": "North America",
    "city": "Chicago"
  },
  "durableLocation": {
    "iata": "ORD",
    "lat": 41.97859955,
    "lon": -87.90480042,
    "cca2": "US",
    "region": "North America",
    "city": "Chicago"
  },
  "visitor": {
    "latitude": "44.78180",
    "longitude": "-93.51650",
    "country": "US",
    "region": "Minnesota",
    "city": "Shakopee",
    "asn": 7922,
    "isp": "Comcast Cable",
    "metroCode": "613",
    "postalCode": "55379"
  }
}
```

Here is the code:
```
import getDistance from 'geolib/es/getDistance' 

export default {
  fetch: async (req, env) => {
    const { colo: workerColo, latitude, longitude, country, region, city, asn, asOrganization: isp, metroCode, postalCode, clientTcpRtt: visitorLatencyToWorker } = req.cf
    const visitor = { latitude, longitude, country, region, city, asn, isp, metroCode, postalCode }
    const locations = await fetch('https://speed.cloudflare.com/locations').then(res => res.json())
    const start = new Date()
    const { colo: doColo } = await env.COLO.get(env.COLO.idFromName(workerColo))
                            .fetch('https://workers.cloudflare.com/cf.json').then(res => res.json())
    const workerLatencyToDurable = new Date() - start
    const workerLocation = locations.find(loc => loc.iata == workerColo)
    const durableLocation = locations.find(loc => loc.iata == doColo)
    const visitorDistanceToWorker = Math.round(getDistance({latitude,longitude}, {latitude: workerLocation.lat, longitude: workerLocation.lon}) / 1000)
    const workerDistanceToDurable = Math.round(getDistance({latitude: workerLocation.lat, longitude: workerLocation.lon}, {latitude: durableLocation.lat, longitude: durableLocation.lon}) / 1000)
    const visitorDistanceToDurable = Math.round(getDistance({latitude,longitude}, {latitude: durableLocation.lat, longitude: durableLocation.lon}) / 1000)
    return new Response(JSON.stringify({ visitorLatencyToWorker, workerLatencyToDurable, visitorDistanceToWorker, workerDistanceToDurable, visitorDistanceToDurable, visitor, workerLocation, durableLocation  }, null, 2))
  }
}

export class Colo {
  async fetch(req) {
    return fetch(req)
  }
}
```
