import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// 시안 번호 폴더(2/, 3/ ...)에 index.html이 있으면 자동으로 같이 빌드해요.
// 1번은 루트(/), 2번은 /2/, 3번은 /3/ 주소로 열려요.
const root = __dirname
const pages: Record<string, string> = { main: resolve(root, 'index.html') }
for (const d of readdirSync(root)) if (/^\d+$/.test(d) && existsSync(resolve(root, d, 'index.html'))) pages['v' + d] = resolve(root, d, 'index.html')

// mode 'single' = 파일 하나짜리 HTML로 묶기 (링크 공유용, 1번만)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist', rollupOptions: mode === 'single' ? undefined : { input: pages } },
}))
