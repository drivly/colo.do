import getDistance from 'geolib/es/getDistance' 
  
export const api = {
  icon: '⚡️',
  name: 'colo.do',
  description: 'Durable Object Colos',
  url: 'https://colo.do/api',
  type: 'https://apis.do/proxies',
  endpoints: {
    getCurrentColo: 'https://colo.do/api',
    proxyFromColo: 'https://ord.colo.do/:url',
  },
  site: 'https://colo.do',
  login: 'https://colo.do/login',
  signup: 'https://colo.do/signup',
  repo: 'https://github.com/drivly/colo.do',
}

export default {
  fetch: async (req, env) => {
    const { hostname, pathname } = new URL(req.url)
    if (pathname == '/api') {
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
      const headers = { 'x-do-colo': doColo, 'x-do-latency': workerLatencyToDurable, 'x-visitor-latency': visitorLatencyToWorker }
      return new Response(JSON.stringify({ visitorLatencyToWorker, workerLatencyToDurable, visitorDistanceToWorker, workerDistanceToDurable, visitorDistanceToDurable, visitor, workerLocation, durableLocation  }, null, 2), { headers })
    }
    const [ colo ] = hostname.split('.')
    return env.COLO.get(env.COLO.idFromName(colo.toUpperCase())).fetch(req)
  }
}

export class Colo {
  constructor(state, env) {
    state.blockConcurrencyWhile(async () => {
      const { colo } = await fetch('https://workers.cloudflare.com/cf.json').then(res => res.json())
      this.colo = colo
      this.env = env
    })
  }
  async fetch(req) {
    if (req.url == 'https://colo.do') return new Response(this.colo)
    
    const { user, origin, requestId, method, body, time, pathname, pathSegments, pathOptions, url, query } = await this.env.CTX.fetch(req).then(res => res.json())
        
    const start = new Date()
    const res = await fetch('https:/' + pathname).catch(console.log())
    const responseTime = new Date() - start
    const status = res.status
    const headers = Object.fromEntries(res?.headers)
    let text = await res?.text()
    let data = undefined
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    
    const colo = {
      iata: this.colo,
      city: colos[this.colo.toLowerCase()],
    }
    api.endpoints = Object.entries(colos).reduce((acc, [colo, name]) => ({ ...acc, [name]: `https://${colo}.colo.do${pathname}`}), {})
    return new Response(JSON.stringify({ api, error, colo, responseTime, status, headers, data, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}

const colos = {
  ams: 'Amsterdam',
  atl: 'Atlanta',
  ord: 'Chicago',
  dfw: 'Dallas',
  den: 'Denver',
  fra: 'Frankfurt',
  hkg: 'Hong Kong',
  lhr: 'London',
  lax: 'Los Angeles',
  mia: 'Miami',
  mrs: 'Marseille',
  mxp: 'Milan',
  ewr: 'Newark',
  kix: 'Osaka',
  cdg: 'Paris',
  prg: 'Prague',
  sjc: 'San Jose',
  sea: 'Seattle',
  sin: 'Singapore',
  arn: 'Stockholm',
  nrt: 'Tokyo',
  via: 'Vienna',
  iad: 'Virginia',
}

let error = undefined

