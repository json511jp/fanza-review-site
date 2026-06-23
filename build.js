// build.js
// productsフォルダのJSONファイルを読み込み、home.htmlと各記事HTMLを生成するスクリプト

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, 'products');
const OUTPUT_DIR = __dirname;
const AFFILIATE_ID = 'json511jp-001';

// -----------------------------------------------
// productsフォルダのJSONを全件読み込む
// -----------------------------------------------
function loadProducts() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));
  const products = files.map(file => {
    const raw = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
    return JSON.parse(raw);
  });
  // content_idのアルファベット順（追加順に近い順）で並べる
  // 必要なら日付フィールドを追加して並び替えも可能
  return products.reverse();
}

// -----------------------------------------------
// 共通CSS（全ページで使用）
// -----------------------------------------------
function commonCSS() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Noto+Sans+JP:wght@300;400;500&display=swap');
    :root { --gold:#b8977e; --gold-dark:#8a6a52; --bg:#0d0d0d; --bg2:#141414; --text:#e8e0d5; --muted:#6a6258; --border:#1e1c1a; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:var(--bg); color:var(--text); font-family:'Noto Sans JP',sans-serif; }
    header { border-bottom:1px solid var(--border); padding:1.2rem 2rem; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:rgba(13,13,13,0.96); backdrop-filter:blur(8px); z-index:100; }
    .site-title { font-family:'Noto Serif JP',serif; font-size:1rem; letter-spacing:0.2em; color:var(--gold); text-decoration:none; }
    .header-note { font-size:0.7rem; color:var(--muted); }
    footer { border-top:1px solid var(--border); padding:2rem; text-align:center; font-size:0.72rem; color:var(--muted); line-height:2; margin-top:3rem; }
  `;
}

// -----------------------------------------------
// home.html（一覧ページ）を生成
// -----------------------------------------------
function buildHome(products) {
  const cards = products.map((p, i) => {
    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const creatorKey = p.meta.circle ? 'サークル' : '著者';
    const creatorVal = p.meta.circle || p.meta.author || '';
    const hiddenClass = i >= 3 ? ' hidden' : '';
    return `
      <a href="${p.content_id}.html" class="card${hiddenClass}">
        <div class="card-img-wrap"><img src="${p.image_url}" alt="${p.title}" loading="lazy"></div>
        <div class="card-body">
          <div class="card-tags">${tagsHtml}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-author">${creatorKey}：${creatorVal}</div>
        </div>
      </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DOUJIN MANGA NAVI | 成人向け同人・漫画紹介</title>
  <style>
    ${commonCSS()}
    .hero { padding:4rem 2rem 3rem; max-width:960px; margin:0 auto; border-bottom:1px solid var(--border); }
    .hero-label { font-size:0.68rem; letter-spacing:0.3em; color:var(--gold); margin-bottom:1.2rem; }
    .hero h1 { font-family:'Noto Serif JP',serif; font-size:clamp(1.6rem,3.5vw,2.4rem); line-height:1.5; margin-bottom:1rem; }
    .hero p { font-size:0.85rem; color:var(--muted); line-height:2; }
    main { max-width:960px; margin:0 auto; padding:3rem 2rem; }
    .section-label { font-size:0.68rem; letter-spacing:0.3em; color:var(--muted); margin-bottom:2rem; padding-bottom:1rem; border-bottom:1px solid var(--border); }
    .card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:1.5rem; }
    .card { background:var(--bg2); border:1px solid var(--border); text-decoration:none; color:inherit; display:block; transition:border-color 0.2s; }
    .card:hover { border-color:var(--gold-dark); }
    .card.hidden { display:none; }
    .card-img-wrap { width:100%; aspect-ratio:3/4; background:#0a0a0a; display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--border); overflow:hidden; }
    .card-img-wrap img { width:100%; height:100%; object-fit:contain; display:block; }
    .card-body { padding:1.2rem; }
    .card-tags { display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.6rem; }
    .tag { font-size:0.62rem; letter-spacing:0.08em; color:var(--gold); border:1px solid var(--gold-dark); padding:0.1rem 0.45rem; }
    .card-title { font-family:'Noto Serif JP',serif; font-size:0.95rem; line-height:1.6; margin-bottom:0.5rem; }
    .card-author { font-size:0.72rem; color:var(--muted); }
    .more-wrap { text-align:center; margin-top:2.5rem; }
    .btn-more { background:transparent; color:var(--gold); border:1px solid var(--gold-dark); padding:0.8rem 2.5rem; font-family:'Noto Sans JP',sans-serif; font-size:0.85rem; letter-spacing:0.15em; cursor:pointer; transition:background 0.2s, color 0.2s; }
    .btn-more:hover { background:var(--gold-dark); color:#fff; }
  </style>
</head>
<body>
  <header>
    <div class="site-title">DOUJIN MANGA NAVI</div>
    <div class="header-note">18歳以上限定 · 成人向けコンテンツ</div>
  </header>
  <div class="hero">
    <div class="hero-label">ADULT DOUJIN &amp; MANGA INTRODUCTION SITE</div>
    <h1>話題の成人向け同人・漫画を<br>まとめて紹介</h1>
    <p>FANZAで配信中の注目作品をピックアップして紹介しています。</p>
  </div>
  <main>
    <div class="section-label">PICKUP — 注目作品</div>
    <div class="card-grid" id="cardGrid">
      ${cards}
    </div>
    <div class="more-wrap" id="moreWrap">
      <button class="btn-more" id="btnMore" onclick="showMore()">もっと見る</button>
    </div>
  </main>
  <footer>
    <p style="color:#b8977e;margin-bottom:0.5rem;">当サイトはアフィリエイト広告（FANZA）を掲載しています。</p>
    <p>当サイトは18歳以上の成人を対象とした成人向け同人・漫画の紹介サイトです。</p>
    <p>未成年者のアクセスは固くお断りします。</p>
    <p style="margin-top:1rem;"><a href="contact.html" style="color:#b8977e;text-decoration:none;">お問い合わせ</a>　<a href="privacy.html" style="color:#b8977e;text-decoration:none;">プライバシーポリシー</a></p>
    <p style="margin-top:0.5rem;">© 2026 Doujin Manga Navi. All rights reserved.</p>
  </footer>
  <script>
    function showMore() {
      document.querySelectorAll('.card.hidden').forEach(function(c){ c.classList.remove('hidden'); });
      document.getElementById('moreWrap').style.display = 'none';
    }
    // 非表示カードが0件ならボタンも非表示
    if (document.querySelectorAll('.card.hidden').length === 0) {
      document.getElementById('moreWrap').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

// -----------------------------------------------
// 記事ページ（content_id.html）を生成
// -----------------------------------------------
function buildArticle(p) {
  const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join('');

  // metaテーブル
  const metaRows = Object.entries(p.meta).map(([k, v]) => {
    const labels = { circle:'サークル', author:'著者', type:'作品形式', pages:'ページ数', theme:'題材' };
    return `<dt>${labels[k] || k}</dt><dd>${v}</dd>`;
  }).join('');

  // 本文セクション
  const sectionsHtml = (p.sections || []).map(s => `
      <h2>${s.heading}</h2>
      <p>${s.body.replace(/\n/g, '<br>')}</p>`).join('');

  // 作品情報ボックス
  const infoRows = Object.entries(p.info_box || {}).map(([k, v]) =>
    `<dt>${k}</dt><dd>${v}</dd>`).join('');

  // サンプル画像グリッド
  const sampleImgs = (p.sample_images || []).map((src, i) =>
    `<img src="${src}" alt="サンプル${i+1}" loading="lazy" onclick="openLightbox(${i})">`).join('\n        ');

  // ライトボックス用画像リスト（JavaScript配列）
  const imgArrayJs = JSON.stringify(p.sample_images || []);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} | DOUJIN MANGA NAVI</title>
  <style>
    ${commonCSS()}
    .back { font-size:0.75rem; color:var(--muted); text-decoration:none; }
    .back:hover { color:var(--gold); }
    article { max-width:720px; margin:0 auto; padding:3.5rem 2rem; }
    .article-tags { display:flex; gap:0.5rem; margin-bottom:1.2rem; flex-wrap:wrap; }
    .tag { font-size:0.62rem; letter-spacing:0.08em; color:var(--gold); border:1px solid var(--gold-dark); padding:0.1rem 0.45rem; }
    h1 { font-family:'Noto Serif JP',serif; font-size:clamp(1.3rem,3vw,1.9rem); line-height:1.6; margin-bottom:1.2rem; }
    .meta { display:grid; grid-template-columns:100px 1fr; gap:0.5rem 1rem; font-size:0.8rem; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border); }
    .meta dt { color:var(--muted); }
    .meta dd { color:var(--text); }
    .main-img { width:100%; max-width:360px; display:block; margin:0 auto 2.5rem; border:1px solid var(--border); cursor:pointer; transition:opacity 0.2s; }
    .main-img:hover { opacity:0.85; }
    .sample-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin:1.5rem 0 2rem; }
    .sample-grid img { width:100%; display:block; border:1px solid var(--border); cursor:pointer; transition:opacity 0.2s; }
    .sample-grid img:hover { opacity:0.8; }
    .body { font-size:0.9rem; line-height:2.1; color:#c8c0b5; }
    .body h2 { font-family:'Noto Serif JP',serif; font-size:1.05rem; color:var(--text); margin:2rem 0 0.8rem; padding-left:0.9rem; border-left:2px solid var(--gold); }
    .body p { margin-bottom:1.2rem; }
    .info-box { background:var(--bg2); border:1px solid var(--border); padding:1.5rem; margin:2rem 0; font-size:0.82rem; }
    .info-box dl { display:grid; grid-template-columns:100px 1fr; gap:0.6rem 1rem; }
    .info-box dt { color:var(--muted); }
    .info-box dd { color:var(--text); }
    .cta { background:linear-gradient(135deg,var(--gold),var(--gold-dark)); color:#fff; display:block; text-align:center; padding:1rem 2rem; text-decoration:none; font-size:0.9rem; letter-spacing:0.1em; margin:2.5rem 0; transition:opacity 0.3s; }
    .cta:hover { opacity:0.85; }
    /* ライトボックス */
    .lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:9999; align-items:center; justify-content:center; }
    .lightbox.active { display:flex; }
    .lightbox img { max-width:80vw; max-height:85vh; object-fit:contain; border:1px solid #333; display:block; }
    .lb-close { position:absolute; top:1.2rem; right:1.5rem; color:#fff; font-size:2rem; cursor:pointer; opacity:0.7; line-height:1; }
    .lb-close:hover { opacity:1; }
    .lb-prev, .lb-next { position:absolute; top:50%; transform:translateY(-50%); color:#fff; font-size:2.5rem; cursor:pointer; opacity:0.6; padding:0 1rem; user-select:none; }
    .lb-prev:hover, .lb-next:hover { opacity:1; }
    .lb-prev { left:0.5rem; }
    .lb-next { right:0.5rem; }
    .lb-counter { position:absolute; bottom:1.2rem; left:50%; transform:translateX(-50%); color:#fff; font-size:0.8rem; opacity:0.6; }
  </style>
</head>
<body>
  <header>
    <a href="home.html" class="site-title">DOUJIN MANGA NAVI</a>
    <a href="home.html" class="back">← 作品一覧へ</a>
  </header>
  <article>
    <div class="article-tags">${tagsHtml}</div>
    <h1>${p.title}</h1>
    <dl class="meta">${metaRows}</dl>

    <a href="${p.affiliate_url}" target="_blank" rel="noopener">
      <img class="main-img" src="${p.image_url}" alt="${p.title} 表紙">
    </a>

    <div class="body">
      ${sectionsHtml}

      <h2>サンプル画像</h2>
      <div class="sample-grid">
        ${sampleImgs}
      </div>

      <div class="info-box">
        <dl>${infoRows}</dl>
      </div>

      <a href="${p.affiliate_url}" class="cta" target="_blank" rel="noopener">FANZAで作品を見る →</a>
    </div>
  </article>
  <footer>© 2026 Doujin Manga Navi — 18歳以上限定サイト</footer>

  <!-- ライトボックス -->
  <div class="lightbox" id="lightbox">
    <span class="lb-close" id="lbClose">&times;</span>
    <span class="lb-prev" id="lbPrev">&#8249;</span>
    <img src="" id="lbImg" alt="">
    <span class="lb-next" id="lbNext">&#8250;</span>
    <div class="lb-counter" id="lbCounter"></div>
  </div>

  <script>
    var imgs = ${imgArrayJs};
    var current = 0;
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbCounter = document.getElementById('lbCounter');

    function openLightbox(index) {
      current = index;
      updateLightbox();
      lb.classList.add('active');
    }
    function updateLightbox() {
      lbImg.src = imgs[current];
      lbCounter.textContent = (current + 1) + ' / ' + imgs.length;
    }
    document.getElementById('lbClose').addEventListener('click', function(){ lb.classList.remove('active'); });
    document.getElementById('lbPrev').addEventListener('click', function(){
      current = (current - 1 + imgs.length) % imgs.length;
      updateLightbox();
    });
    document.getElementById('lbNext').addEventListener('click', function(){
      current = (current + 1) % imgs.length;
      updateLightbox();
    });
    lb.addEventListener('click', function(e){
      if (e.target === lb) lb.classList.remove('active');
    });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') { current = (current - 1 + imgs.length) % imgs.length; updateLightbox(); }
      if (e.key === 'ArrowRight') { current = (current + 1) % imgs.length; updateLightbox(); }
      if (e.key === 'Escape') lb.classList.remove('active');
    });
  </script>
</body>
</html>`;
}

// -----------------------------------------------
// メイン処理
// -----------------------------------------------
const products = loadProducts();
console.log(`${products.length}件の商品データを読み込みました`);

// home.html を生成
fs.writeFileSync(path.join(OUTPUT_DIR, 'home.html'), buildHome(products), 'utf-8');
console.log('home.html を生成しました');

// 各記事HTMLを生成
products.forEach(p => {
  const html = buildArticle(p);
  const outPath = path.join(OUTPUT_DIR, `${p.content_id}.html`);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`${p.content_id}.html を生成しました`);
});

console.log('ビルド完了');
