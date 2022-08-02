import getDistance from 'distance' 

export default {
  fetch: async (req, env) => {
    const { colo: workerColo, latitude, longitude, country, region, city, asn, asOrganization: isp, metroCode, postalCode, clientTcpRtt: latency } = req.cf
    const visitor = { latitude, longitude, country, region, city, asn, isp, metroCode, postalCode, latency }
    const locations = await fetch('https://speed.cloudflare.com/locations').then(res => res.json())
    const start = new Date()
    const { colo: doColo } = await env.COLO.get(env.COLO.idFromName(workerColo))
                            .fetch('https://workers.cloudflare.com/cf.json').then(res => res.json())
    const durableObjectLatency = new Date() - start
    const workerLocation = locations.find(loc => loc.iata == workerColo)
    const durableLocation = locations.find(loc => loc.iata == doColo)
    const visitorDistanceToWorker = getDistance({latitude,longitude}, {latitude: workerLocation.lat, longitude: workerLocation.lon}) / 1000
    const workerDistanceToDurable = getDistance({latitude: workerLocation.lat, longitude: workerLocation.lon}, {latitude: durableLocation.lat, longitude: durableLocation.lon}) / 1000
    const visitorDistanceToDurable = getDistance({latitude,longitude}, {latitude: durableLocation.lat, longitude: durableLocation.lon}) / 1000
    return new Response(JSON.stringify({ durableObjectLatency, visitorDistanceToWorker, workerDistanceToDurable, visitorDistanceToDurable,  workerLocation, durableLocation, visitor }, null, 2))
  }
}

export class Colo {
  async fetch(req) {
    return fetch(req)
  }
}
