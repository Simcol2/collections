const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Pin the workspace root to THIS project — prevents Next.js from
  // picking up the stray package-lock.json at C:\Users\simon\
  outputFileTracingRoot: path.join(__dirname),
}
