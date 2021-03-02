import { scrapeData, downloadFileTo } from './scrape'
import path = require('path')
import sqlite3 = require('better-sqlite3')
import fs = require('fs/promises')
import PQueue from 'p-queue'

if (process.argv.length <= 3) {
	console.log('Please provide input file and output dir')
	process.exit(1)
}

const DB_FILE = path.join(process.cwd(), process.argv[2])
const db = sqlite3(DB_FILE)
const OUTPUT_DIR = path.join(process.cwd(), process.argv[3])

async function mkdirIfNotExist(dir: string, recursive: boolean = false) {
	try {
		await fs.access(dir)
	} catch (e) {
		await fs.mkdir(dir, { recursive })
	}
}

;(async () => {
	await mkdirIfNotExist(OUTPUT_DIR, true)
	const result = db.prepare('SELECT * FROM article_urls WHERE is_fetched = 0').all()
	const fetchedStat = db.prepare('UPDATE article_urls SET is_fetched = 1 WHERE id = ?')
	const imgDLQueue = new PQueue({ concurrency: 5 })
	for (const { id, url } of result) {
		console.log(`Scraping ${id}`)
		const data = await scrapeData(url)
		const dataDir = path.join(OUTPUT_DIR, id.toString())
		await mkdirIfNotExist(dataDir)
		const jsonFile = path.join(dataDir, 'data.json')
		await fs.writeFile(jsonFile, JSON.stringify(data))
		imgDLQueue
			.addAll(data.imageUrls.map(img => () => downloadFileTo(img, path.join(dataDir, path.basename(img)))))
			.then(() => {
				fetchedStat.run(id)
				console.log(`${id} complete`)
			})
	}
})()
