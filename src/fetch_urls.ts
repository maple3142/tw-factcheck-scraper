import { fetchUrlsList } from './scrape'
import fs = require('fs/promises')
import path = require('path')
import sqlite3 = require('better-sqlite3')
import assert = require('assert')

if (process.argv.length <= 2) {
	console.log('Please provide output file')
	process.exit(1)
}

const BASE_URL = 'https://tfc-taiwan.org.tw/articles/report?page='
const MAX_PAGE = 83
const DB_FILE = path.join(process.cwd(), process.argv[2])
const db = sqlite3(DB_FILE)
db.exec('CREATE TABLE IF NOT EXISTS article_urls (id INTEGER, url TEXT, is_fetched INTEGER)')
;(async () => {
	const stat = db.prepare('INSERT INTO article_urls (id, url, is_fetched) VALUES (?, ?, 0)')
	for (let page = 0; page <= MAX_PAGE; page++) {
		console.log(`Processing page ${page}`)
		const url = BASE_URL + page
		const urls = await fetchUrlsList(url)
		for (const u of urls) {
			const id = parseInt(u.split('/').pop()!)
			assert(!isNaN(id))
			stat.run(id, u)
		}
	}
})()
