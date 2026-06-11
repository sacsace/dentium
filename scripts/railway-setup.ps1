# Railway CLI setup (run once after `railway login`)

Write-Host "Linking project..." -ForegroundColor Cyan
railway link

Write-Host "`nSetting required variables on dentium service..." -ForegroundColor Cyan

$jwt = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
Write-Host "Generated JWT_SECRET (save this somewhere safe)" -ForegroundColor Yellow

railway variables set `
  JWT_SECRET="$jwt" `
  ADMIN_EMAIL="admin@dentium.in" `
  NEXT_PUBLIC_APP_NAME="Dentium" `
  NEXT_PUBLIC_APP_URL="https://dentium-production.up.railway.app"

Write-Host "`nAdd DATABASE_URL via Railway dashboard:" -ForegroundColor Yellow
Write-Host "  dentium > Variables > New Variable > Reference > Postgres > DATABASE_URL"
Write-Host "`nRemove unused variables if present: AUTH_URL, AUTH_TRUST_HOST, POSTGRES_*"
Write-Host "`nAfter deploy succeeds, run seed once:" -ForegroundColor Cyan
Write-Host "  railway run npm run db:seed"
Write-Host "`nRedeploy:" -ForegroundColor Cyan
Write-Host "  railway up"
