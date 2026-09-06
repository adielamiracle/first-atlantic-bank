export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    version: '4.9.2',
    server: 'First Atlantic Bank Sovereign Core Engine',
    timestamp: new Date().toISOString()
  });
}
