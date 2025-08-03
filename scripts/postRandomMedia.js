const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

(async () => {
  try {
    const mediaDir = path.join(__dirname, '..', 'media');
    const files = fs.readdirSync(mediaDir).filter(file => /\.(jpg|png|mp4)$/i.test(file));
    if (!files.length) {
      console.error('No media files found in', mediaDir);
      process.exit(1);
    }

    const chosen = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(mediaDir, chosen);
    const ext = path.extname(chosen).toLowerCase();

    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const mediaType = ext === '.mp4' ? 'video/mp4' : `image/${ext.slice(1)}`;
    const mediaId = await client.v1.uploadMedia(fs.readFileSync(filePath), { mimeType: mediaType });
    await client.v2.tweet({ media: { media_ids: [mediaId] } });
    console.log(`Posted ${chosen} to Twitter`);
  } catch (err) {
    console.error('Failed to post media:', err);
    process.exit(1);
  }
})();
