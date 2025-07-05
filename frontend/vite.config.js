// D:/code/SofewareEngineer/frontend/vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 如果你项目中有路径别名（例如 '@' 映射到 'src'），你可能需要在这里添加 resolve 配置
  // resolve: {
  //   alias: {
  //     '@': '/src', // 注意这里是绝对路径，或者使用 path 模块
  //   },
  // },
})