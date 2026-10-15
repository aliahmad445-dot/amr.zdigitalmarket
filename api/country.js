// Tells the page which country the visitor is in, so prices can be shown in their currency.
// Vercel adds the x-vercel-ip-country header from the visitor's IP address. Nothing is stored.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ country: req.headers['x-vercel-ip-country'] || null });
};
