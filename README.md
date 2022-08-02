# colo.do
Cloudflare Durable Object Proxy for specific Colo Locations

```
export default {
  fetch: async (req, env) => {
    const { colo: workerColo, longitude, longitude, country, region, city, asn, asOrganization, metroCode, postalCode, clientTcpRtt: latency } = req.cf
    const visitor = { longitude, longitude, country, region, city, asn, asOrganization, metroCode, postalCode, latency }
    const locations = await fetch('https://speed.cloudflare.com/locations').then(res => res.json())
    const start = new Date()
    const { colo: doColo } = await env.COLO.get(env.COLO.idFromName(workerColo))
                            .fetch('https://workers.cloudflare.com/cf.json').then(res => res.json())
    const durableObjectLatency = new Date() - start
    const workerLocation = locations.find(loc => loc == workerColo)
    const durableObjectLocation = locations.find(loc => loc == doColo)
    return new Response(JSON.stringify({ durableObjectLatency, workerLocation, durableObjectLocation, visitor }, null, 2))
  }
}

export class Colo {
  async fetch(req) {
    return fetch(req)
  }
}
```
