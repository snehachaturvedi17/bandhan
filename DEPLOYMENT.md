# Bandhan AI - Demo Deployment Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run in demo mode (local development)
npm run demo

# Build for demo deployment
npm run build:demo

# Deploy to Vercel
npm run demo:deploy
```

## Environment Configuration

### Local Development (.env.local)

```bash
# Copy the example file
cp .env.local.example .env.local

# All values are pre-configured for demo mode
# No real API keys required
```

### Production Deployment

Set these environment variables in your deployment platform:

```bash
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_API_URL=/api/mock
NEXT_PUBLIC_FIREBASE_MOCK=true
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Platforms

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy:

```bash
npm run deploy:vercel
```

Or use the Vercel CLI:
```bash
vercel --prod
```

**vercel.json** is pre-configured with:
- Mock API rewrites
- Security headers
- Demo mode enforcement
- Region: Singapore (sin1) for Indian users

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build:demo`
3. Set publish directory: `.next`
4. Deploy:

```bash
npm run deploy:netlify
```

Or use Netlify CLI:
```bash
netlify deploy --prod
```

**netlify.toml** is pre-configured with:
- Mock API redirects
- Security headers
- Demo mode environment variables

## Health Check

After deployment, verify the demo is working:

```bash
# Local
curl http://localhost:3000/api/health

# Remote (Vercel)
curl https://bandhan-ai-demo.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "demoMode": true,
  "production": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Demo Mode Features

✅ **No Real API Calls** - All API requests are mocked
✅ **Mock Authentication** - Use OTP `123456` for any phone number
✅ **Pre-created Demo Accounts** - 4 realistic Indian profiles
✅ **Mock Conversations** - Pre-written chat histories
✅ **Safety Features** - All demo functionality available
✅ **No Database Required** - Uses localStorage for persistence

## Keyboard Shortcuts (Presenter Mode)

| Shortcut | Action |
|----------|--------|
| `Ctrl+D` | Toggle demo mode |
| `Ctrl+R` | Reset demo data |
| `Ctrl+F` | Show all features |
| `Ctrl+K` | Toggle console logs |

## Demo Accounts

| Name | Age | City | Verification |
|------|-----|------|--------------|
| Priya Sharma | 26 | Mumbai | 🥇 Gold |
| Rohan Verma | 28 | Delhi | 🥈 Silver |
| Anjali Iyer | 24 | Bangalore | 🥉 Bronze |
| Vikram Krishnan | 30 | Chennai | 🥇 Gold |

## Security

- All production deployments force demo mode
- No real Firebase credentials required
- No database connection required
- All API calls are mocked
- Security headers enabled by default

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build:demo
```

### API Calls Not Mocked

Check middleware is working:
```bash
curl -I http://localhost:3000/api/health
# Should show: X-Demo-Mode: true
```

### Demo Mode Not Enabled

Verify environment variable:
```bash
echo $NEXT_PUBLIC_DEMO_MODE
# Should output: true
```

## Custom Domain

### Vercel

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` in environment variables

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Update `NEXT_PUBLIC_APP_URL` in environment variables

## Post-Deployment Checklist

- [ ] Health check endpoint returns 200
- [ ] Demo mode is enabled (`X-Demo-Mode: true` header)
- [ ] Demo landing page loads at `/demo`
- [ ] Mock authentication works (OTP: 123456)
- [ ] All API routes return mock data
- [ ] Security headers are present
- [ ] Images load correctly
- [ ] No console errors

## Support

For issues or questions:
1. Check health endpoint: `/api/health`
2. Review middleware logs in deployment platform
3. Verify environment variables are set correctly
4. Check browser console for errors
