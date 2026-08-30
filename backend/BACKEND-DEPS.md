# New backend dependencies

Two packages needed for the video + materials features, neither was
already in the codebase I've seen:

```bash
npm install cloudinary multer
```

- `cloudinary` — powers `services/cloudinaryService.js` (skill/session file uploads)
- `multer` — powers `routes/materialRoutes.js` (multipart/form-data parsing for the upload endpoint)

`dailyService.js` uses plain `fetch`, which is built into Node 18+ — no new
package needed there. If you're on an older Node version, you'd need
`node-fetch` instead; check with `node --version`.
