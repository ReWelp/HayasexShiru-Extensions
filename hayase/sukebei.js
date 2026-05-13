export default new class Nyaa {
  base = 'https://nyaa.si'

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = this.single
  movie = this.single

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`

    const url = `${this.base}/?page=rss&f=0&c=0_0&q=${encodeURIComponent(query)}`
    const res = await fetch(url)
    if (!res.ok) return []

    const xml = await res.text()
    return this._parseRSS(xml)
  }

  _parseRSS(xml) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    const items = Array.from(doc.querySelectorAll('item'))

    return items.map(item => {
      const get = tag => item.querySelector(tag)?.textContent?.trim() ?? ''
      const getNS = (ns, tag) => item.getElementsByTagNameNS(ns, tag)[0]?.textContent?.trim() ?? '0'

      const nyaaNS = 'https://nyaa.si/xmlns/nyaa'
      const magnet = get('link') || get('guid')
      const hash = magnet?.match(/btih:([A-Fa-f0-9]+)/i)?.[1] ?? ''
      const pubDate = get('pubDate')

      return {
        title: get('title'),
        link: magnet,
        hash: hash.toLowerCase(),
        seeders: Number(getNS(nyaaNS, 'seeders')),
        leechers: Number(getNS(nyaaNS, 'leechers')),
        downloads: Number(getNS(nyaaNS, 'downloads')),
        size: 0,
        date: pubDate ? new Date(pubDate) : new Date(0),
        accuracy: 'medium',
        type: 'alt'
      }
    }).filter(item => item.link)
  }

  async test() {
    const res = await fetch(`${this.base}/?page=rss&f=0&c=0_0&q=test`)
    return res.ok
  }
}()