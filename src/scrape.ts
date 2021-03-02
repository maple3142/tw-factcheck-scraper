import got from 'got'
import { JSDOM } from 'jsdom'
import fs from 'fs'

type Correctness = '正確' | '錯誤' | '部分錯誤' | '事實釐清' | '證據不足'

interface ArticleData {
	title: string
	html: string
	type: Correctness
	imageUrls: string[]
}

export async function scrapeData(url: string): Promise<ArticleData> {
	const { body } = await got.get(url)
	const dom = new JSDOM(body, { url })
	const doc = dom.window.document
	const main = doc.querySelector('.content-main')
	const title = main.querySelector('.node-title').textContent.trim()
	const header = main.querySelector('.node-header')
	const type = header.querySelector('.field-item.odd').textContent.trim() as Correctness
	const html = main.querySelector('.node-content > .field-name-body').innerHTML
	const imageUrls = Array.from(main.querySelectorAll<HTMLImageElement>('.node-content img')).map(el => el.src)
	return {
		title,
		html,
		type,
		imageUrls
	}
}

export function downloadImage(url: string, path: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const stream = got.stream(url).pipe(fs.createWriteStream(path))
		stream.once('finish', resolve)
		stream.once('error', reject)
	})
}
