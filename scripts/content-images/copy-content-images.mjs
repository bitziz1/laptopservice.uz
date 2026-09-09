import fs from 'fs';
import path from 'path';

const srcRoot = 'content';
const destRoot = 'dist/content';
const exts = new Set(['.jpg','.jpeg','.png','.webp','.avif','.gif','.svg','.mp4','.webm','.mov','.m4v','.mp3','.ogg']);

function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }

let copied=0, skipped=0;
function walk(dir){
  const entries = fs.readdirSync(dir, {withFileTypes:true});
  for(const e of entries){
    const src = path.join(dir, e.name);
    const rel = path.relative(srcRoot, src);
    const dest = path.join(destRoot, rel);
    if(e.isDirectory()){
      walk(src);
    } else if(exts.has(path.extname(e.name).toLowerCase())){
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
      copied++;
    } else {
      skipped++;
    }
  }
}
if(!fs.existsSync(srcRoot)){ console.log('no content dir'); process.exit(0); }
ensureDir(destRoot);
walk(srcRoot);
console.log(`copy-content-images: copied ${copied} images -> ${destRoot} (skipped ${skipped} non-images)`);

// Mirror videos to public/content for `astro dev` (public is served at root)
// Only videos need mirroring - images via Astro, so keep public clean
try {
  const publicRoot = 'public/content';
  ensureDir(publicRoot);
  const videoExts = new Set(['.mp4','.webm','.mov','.m4v']);
  function mirrorVideos(srcDir, pubDir){
    const entries = fs.readdirSync(srcDir, {withFileTypes:true});
    for(const e of entries){
      const src = path.join(srcDir, e.name);
      const dest = path.join(pubDir, e.name);
      if(e.isDirectory()){
        mirrorVideos(src, dest);
      } else if(videoExts.has(path.extname(e.name).toLowerCase())){
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        // also copy poster jpg with same basename if exists (mp4 -> jpg)
        const base = dest.slice(0, -path.extname(dest).length);
        const posterSrc = src.slice(0, -path.extname(src).length) + '.jpg';
        const posterDest = base + '.jpg';
        if(fs.existsSync(posterSrc)) fs.copyFileSync(posterSrc, posterDest);
      }
    }
  }
  mirrorVideos(srcRoot, publicRoot);
  console.log(`mirrored videos to ${publicRoot}`);
} catch(e){ console.warn('mirror to public failed', e.message); }

// Keep + optimize poster jpgs for videos: compress jpg in-place + generate webp/avif alongside (jpg stays for poster compat)
try {
  const sharp = (await import('sharp')).default;
  async function optimizePosters(root){
    let opt=0;
    async function scan(dir){
      const entries = fs.readdirSync(dir, {withFileTypes:true});
      for(const e of entries){
        const p = path.join(dir, e.name);
        if(e.isDirectory()) await scan(p);
        else if(p.endsWith('.mp4')){
          const base = p.slice(0, -4);
          const jpg = base + '.jpg';
          if(fs.existsSync(jpg)){
            const buf = fs.readFileSync(jpg);
            const outJpg = await sharp(buf).jpeg({ quality: 75, mozjpeg: true }).toBuffer();
            if(outJpg.length < buf.length) fs.writeFileSync(jpg, outJpg);
            const webp = base + '.webp';
            if(!fs.existsSync(webp)) await sharp(buf).webp({ quality: 70 }).toFile(webp);
            const avif = base + '.avif';
            if(!fs.existsSync(avif)) await sharp(buf).avif({ quality: 50 }).toFile(avif);
            opt++;
          }
        }
      }
    }
    await scan(root);
    if(opt) console.log(`optimized ${opt} poster(s) in ${root} (jpg 75 + webp/avif)`);
  }
  await optimizePosters(destRoot);
  if(fs.existsSync('public/content')) await optimizePosters('public/content');
} catch(e){ console.warn('poster optimize failed', e.message); }
