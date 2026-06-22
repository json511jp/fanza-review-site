// fetch-product.js
// GitHub Actions から呼び出され、DMM API で商品情報を取得して
// products/{content_id}.json を作成するスクリプト

const fs = require('fs');
const path = require('path');
const https = require('https');

const DMM_API_ID       = process.env.DMM_API_ID;
const DMM_AFFILIATE_ID = process.env.DMM_AFFILIATE_ID;       // APIリクエスト用（json511jp-990）
const REVENUE_AF_ID    = process.env.REVENUE_AFFILIATE_ID;   // 収益用（json511jp-001）
const CONTENT_ID       = process.env.CONTENT_ID;

if (!DMM_API_ID || !DMM_AFFILIATE_ID || !CONTENT_ID) {
  console.error('環境変数 DMM_API_ID / DMM_AFFILIATE_ID / CONTENT_ID が不足しています');
  process.exit(1);
}

// DMM API エンドポイント（同人）
const API_URL = `https://api.dmm.com/affiliate/v3/ItemList`
  + `?api_id=${DMM_API_ID}`
  + `&affiliate_id=${DMM_AFFILIATE_ID}`
  + `&site=FANZA`
  + `&service=doujin`
  + `&output=json`
  + `&cid=${CONTENT_ID}`;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSONパース失敗: ' + data)); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`商品情報を取得中: ${CONTENT_ID}`);
  const res = await fetchJson(API_URL);

  if (!res.result || !res.result.items || res.result.items.length === 0) {
    console.error('商品が見つかりませんでした。content_idを確認してください: ' + CONTENT_ID);
    console.error('APIレスポンス:', JSON.stringify(res, null, 2));
    process.exit(1);
  }

  const item = res.result.items[0];

  // タグ（genre）を配列に変換
  const tags = (item.iteminfo && item.iteminfo.genre)
    ? item.iteminfo.genre.map(g => g.name)
    : [];

  // サークル名（doujin の場合は maker）
  const circle = (item.iteminfo && item.iteminfo.maker && item.iteminfo.maker[0])
    ? item.iteminfo.maker[0].name
    : null;

  // 著者（author がある場合）
  const author = (item.iteminfo && item.iteminfo.author && item.iteminfo.author[0])
    ? item.iteminfo.author[0].name
    : null;

  // 作品形式（kind: comic / game / etc）
  const kind = (item.iteminfo && item.iteminfo.kind && item.iteminfo.kind[0])
    ? item.iteminfo.kind[0].name
    : null;

  // ページ数
  const pages = item.volume || null;

  // サンプル画像
  const sampleImages = (item.sampleImageURL && item.sampleImageURL.sample_s)
    ? item.sampleImageURL.sample_s.image.map(img =>
        // 小サイズURLを大サイズに変換（末尾 -jp-xxx.jpg 形式）
        img.replace('//pics.dmm.co.jp/digital/', '//doujin-assets.dmm.co.jp/digital/')
      )
    : [];

  // アフィリエイトURLのAPI用IDを収益用IDに置換
  const affiliateUrl = (item.affiliateURL || '')
    .replace(DMM_AFFILIATE_ID, REVENUE_AF_ID);

  // 説明文（iteminfo.description または iteminfo.comment）
  const description = item.iteminfo && item.iteminfo.comment
    ? item.iteminfo.comment
    : (item.description || '');

  // meta オブジェクト
  const meta = {};
  if (circle) meta.circle = circle;
  if (author) meta.author = author;
  if (kind)   meta.type = kind;
  if (pages)  meta.pages = pages + 'ページ';
  meta.theme = 'オリジナル';

  // info_box オブジェクト
  const infoBox = {};
  if (circle) infoBox['サークル'] = circle;
  if (author) infoBox['著者'] = author;
  if (kind)   infoBox['作品形式'] = kind;
  if (tags.length) infoBox['ジャンル'] = tags.join('・');
  if (pages)  infoBox['ページ数'] = pages + 'ページ';
  infoBox['配信'] = 'FANZA同人';

  // JSONオブジェクトを組み立てる
  const product = {
    content_id: CONTENT_ID,
    title: item.title,
    affiliate_url: affiliateUrl,
    image_url: item.imageURL ? item.imageURL.large : '',
    sample_images: sampleImages,
    tags: tags,
    meta: meta,
    sections: [
      {
        heading: '作品コメント',
        body: description
      }
    ],
    info_box: infoBox
  };

  // products/ フォルダに書き出す
  const outputPath = path.join(__dirname, 'products', `${CONTENT_ID}.json`);
  fs.mkdirSync(path.join(__dirname, 'products'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(product, null, 2), 'utf-8');
  console.log(`保存しました: ${outputPath}`);
  console.log(`タイトル: ${item.title}`);
  console.log(`タグ: ${tags.join(', ')}`);
}

main().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
