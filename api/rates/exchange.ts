export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    base: 'USD',
    timestamp: new Date().toISOString(),
    rates: {
      USD: { USD: 1.0, GBP: 0.785, EUR: 0.92 },
      GBP: { USD: 1.274, GBP: 1.0, EUR: 1.172 },
      EUR: { USD: 1.087, GBP: 0.853, EUR: 1.0 }
    }
  });
}
