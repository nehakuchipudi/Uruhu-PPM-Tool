# Uruhu PPM Tool - Azure Deployment Steps

## Current Progress
✅ Resource Group created: `uruhu-ppm-rg`
✅ Azure Static Web Apps CLI installed and configured
⏳ PostgreSQL provider registration in progress
⏳ App Service Plan creation in progress

## Next Steps

### 1. Complete Resource Creation

Wait for the current operations to complete, then verify:

```powershell
# Check PostgreSQL provider registration
az provider show --namespace Microsoft.DBforPostgreSQL --query "registrationState"

# Check App Service Plan
az appservice plan show --name uruhu-ppm-plan --resource-group uruhu-ppm-rg
```

### 2. Create PostgreSQL Database

```powershell
$DB_SERVER_NAME="uruhu-ppm-db-server"
$DB_ADMIN_USER="ppmadmin"
$DB_ADMIN_PASSWORD="SecurePass123!"  # Change this!
$DB_NAME="uruhu_ppm"

# Create PostgreSQL server
az postgres flexible-server create `
  --name $DB_SERVER_NAME `
  --resource-group uruhu-ppm-rg `
  --location westus2 `
  --admin-user $DB_ADMIN_USER `
  --admin-password $DB_ADMIN_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 16 `
  --storage-size 32 `
  --public-access 0.0.0.0

# Create database
az postgres flexible-server db create `
  --resource-group uruhu-ppm-rg `
  --server-name $DB_SERVER_NAME `
  --database-name $DB_NAME

# Get connection string
$DB_HOST = az postgres flexible-server show `
  --resource-group uruhu-ppm-rg `
  --name $DB_SERVER_NAME `
  --query "fullyQualifiedDomainName" -o tsv

Write-Host "Database Connection String:"
Write-Host "postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"
```

### 3. Prepare Backend for Deployment

Create `server/package.json`:

```json
{
  "name": "uruhu-ppm-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "npx prisma generate"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "pg": "^8.17.2",
    "@prisma/client": "^7.3.0",
    "@prisma/adapter-pg": "^7.3.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/cors": "^2.8.19",
    "@types/node": "^25.0.10",
    "typescript": "^5.9.3",
    "prisma": "^7.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Create `server/.env.production`:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=<your-postgresql-connection-string>
```

### 4. Deploy Backend to Azure App Service

```powershell
# Build backend
cd server
npm install
npm run build

# Create Web App
$BACKEND_APP_NAME="uruhu-ppm-backend-$(Get-Random -Minimum 1000 -Maximum 9999)"

az webapp create `
  --name $BACKEND_APP_NAME `
  --resource-group uruhu-ppm-rg `
  --plan uruhu-ppm-plan `
  --runtime "NODE:18-lts"

# Configure environment variables
az webapp config appsettings set `
  --name $BACKEND_APP_NAME `
  --resource-group uruhu-ppm-rg `
  --settings DATABASE_URL="<your-postgresql-connection-string>" NODE_ENV="production"

# Deploy code
az webapp deploy `
  --name $BACKEND_APP_NAME `
  --resource-group uruhu-ppm-rg `
  --src-path dist.zip `
  --type zip

# Get backend URL
$BACKEND_URL = az webapp show `
  --name $BACKEND_APP_NAME `
  --resource-group uruhu-ppm-rg `
  --query "defaultHostName" -o tsv

Write-Host "Backend URL: https://${BACKEND_URL}"
```

### 5. Deploy Frontend to Azure Static Web Apps

```powershell
# Build frontend
cd ..
npm run build

# Deploy to Azure
npx swa deploy --env production --deployment-token <your-token>

# Or use interactive deployment
npx swa deploy
```

The SWA CLI will prompt you to:
1. Select your Azure subscription
2. Choose or create a Static Web App resource
3. Configure the deployment

### 6. Update Frontend API Configuration

Update your frontend to point to the deployed backend URL:

```typescript
// src/config/api.ts or similar
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://<your-backend-url>.azurewebsites.net'
  : 'http://localhost:3001';
```

### 7. Run Database Migrations

```powershell
# From your local machine
cd server
npx prisma migrate deploy --schema=../prisma/schema.prisma

# Or connect to the deployed backend and run:
npx prisma db push
```

### 8. Configure CORS on Backend

Ensure your backend CORS configuration includes the Static Web App URL:

```typescript
// server/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://<your-static-web-app>.azurestaticapps.net'
  ]
}));
```

## Quick Deploy Commands

Once everything is set up, use these for redeployment:

```powershell
# Frontend
npm run build
npx swa deploy --env production

# Backend
cd server
npm run build
az webapp deploy --name $BACKEND_APP_NAME --resource-group uruhu-ppm-rg --src-path dist.zip --type zip
```

## Monitoring

- **Frontend**: https://portal.azure.com → Static Web Apps → uruhu-ppm-tool
- **Backend**: https://portal.azure.com → App Services → uruhu-ppm-backend-*
- **Database**: https://portal.azure.com → Azure Database for PostgreSQL → uruhu-ppm-db-server

## Cost Estimates

- Resource Group: Free
- Static Web App: Free tier available
- App Service (B1): ~$13/month
- PostgreSQL (Standard_B1ms): ~$12/month
- **Total: ~$25/month** (with free tier for Static Web App)

## Security Notes

1. **Change the default database password** in the deployment script
2. Enable **Azure AD authentication** for production
3. Configure **private endpoints** for database if needed
4. Set up **Application Insights** for monitoring
5. Enable **SSL/TLS** for all connections
6. Use **Azure Key Vault** for secrets management

## Troubleshooting

### Issue: PostgreSQL provider not registered
```powershell
az provider register --namespace Microsoft.DBforPostgreSQL --wait
```

### Issue: Build fails
```powershell
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Database connection fails
- Check firewall rules in Azure Portal
- Verify connection string format
- Ensure SSL mode is set correctly

### Issue: CORS errors
- Add Static Web App URL to backend CORS configuration
- Redeploy backend after changes

## Alternative: Use Azure Developer CLI (Recommended)

For a more streamlined experience, install Azure Developer CLI:

```powershell
# Install azd
winget install microsoft.azd

# Initialize project
azd init

# Deploy everything
azd up
```

This will handle infrastructure provisioning and deployment automatically.
