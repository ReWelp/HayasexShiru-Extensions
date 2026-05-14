module.exports = new class Nyaa {
  base = 'https://torrent-search-api-livid.vercel.app/api/nyaasi/'

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = this.single
  movie = this.single

  async search(title, episode) {
    try {
      if (!title) return []

      let query = title.replace(/[^\w\s-]/g, ' ').trim()

      if (episode !== undefined && episode !== null) {
        query += ` ${String(episode).padStart(2, '0')}`
      }

      const res = await fetch(this.base + encodeURIComponent(query))
      if (!res.ok) return []

      const data = await res.json()
      if (!Array.isArray(data)) return []

      return data.map(item => ({
        title: item.Name || 'Unknown',
        link: item.Magnet || '',

        hash:
          item.Magnet?.match(/btih:([A-Za-z0-9]+)/)?.[1] || '',

        seeders: Number(item.Seeders ?? 0),
        leechers: Number(item.Leechers ?? 0),
        downloads: Number(item.Downloads ?? 0),

        size: item.Size || 'Unknown',

        date: item.DateUploaded
          ? new Date(item.DateUploaded)
          : new Date(0),

        accuracy: 'medium',
        type: 'torrent'
      }))
    } catch (err) {
      return []
    }
  }

  async test() {
    try {
      const res = await fetch(this.base + 'one%20piece')
      return res.ok
    } catch {
      return false
    }
  }
}