# 台灣事實查核中心爬蟲

https://tfc-taiwan.org.tw/

## 使用方法

### 抓取需要的文章列表

```bash
yarn ts-node src/fetch_urls.ts data/data.db # 把資料存到 data/data.db
```

### 下載文章內容與圖片

```bash
yarn ts-node src/fetch_articles.ts data/data.db data/result # 從 data/data.db 讀取網址並下載到 data/result
```
