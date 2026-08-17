import { renderPublicHtml } from './server/urlApi.ts';
const result = await renderPublicHtml('https://unstop.com/hackathons/');
console.log(JSON.stringify({ bytes: Buffer.byteLength(result.html), hackathonLinks: (result.html.match(/id="i_[^"]+"/g) || []).length, title: (result.html.match(/<title>([^<]+)/i) || [])[1], hasMatrix: result.html.includes('Matrix 2026'), hasWait: result.html.includes('Please Wait') }));
