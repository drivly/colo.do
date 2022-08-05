import getDistance from 'geolib/es/getDistance' 
  
export default {
  fetch: async (req, env) => {
    const { colo: workerColo, latitude, longitude, country, region, city, asn, asOrganization: isp, metroCode, postalCode, clientTcpRtt: visitorLatencyToWorker } = req.cf
    const visitor = { latitude, longitude, country, region, city, asn, isp, metroCode, postalCode }
    const locations = await fetch('https://speed.cloudflare.com/locations').then(res => res.json())
    const stub = env.COLO.get(env.COLO.idFromName(workerColo))
    const start = new Date()
    const doColo = await stub.fetch('https://colo.do').then(res => res.text())
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
  constructor(state, env) {
    state.blockConcurrencyWhile(async () => {
      const { colo } = await stub.fetch('https://workers.cloudflare.com/cf.json').then(res => res.json())
      this.colo =  colo
    })
  }
  async fetch(req) {
     return new Response(this.colo)
  }
}
