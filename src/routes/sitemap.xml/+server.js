import { tools } from '../tools.js';

export async function GET() {
  const response = new Response(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
  <loc>https://developerstar.com/</loc>
  <priority>1.00</priority>
  </url>
  <url>
  <loc>https://developerstar.com/about</loc>
  <priority>0.80</priority>
  </url>
  <url>
  <loc>https://developerstar.com/roadmap</loc>
  <priority>0.80</priority>
  </url>
  <url>
  <loc>https://developerstar.com/contact</loc>
  <priority>0.80</priority>
  </url>
  ${Object.values(tools).map((page) => `
  <url>
    <loc>https://developerstar.com${page.link}</loc>
    <priority>0.8</priority>
  </url>
  `).join('')}
  <url>
  <loc>https://developerstar.com/terms-and-conditions</loc>
  <priority>0.70</priority>
  </url>
  <url>
  <loc>https://developerstar.com/privacy-policy</loc>
  <priority>0.70</priority>
  </url>
  </urlset>`);
  response.headers.set('Cache-Control', 'max-age=0, s-maxage=3600');
  response.headers.set('Content-Type', 'application/xml');
  return response;
}