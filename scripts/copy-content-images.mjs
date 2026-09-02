import fs from 'fs';
import path from 'path';

const srcRoot = 'content';
const destRoot = 'dist/content';
const exts = new Set(['.jpg','.jpeg','.png','.webp','.avif','.gif','.svg']);

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
// also copy public/content if exists? nothing
