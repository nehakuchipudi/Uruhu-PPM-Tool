# Azure Deployment Guide - Uruhu PPM Tool

This guide will help you deploy your full-stack application to Azure.

## Architecture Overview

- **Frontend (React + Vite)** → Azure Static Web Apps
- **Backend (Express + Node.js)** → Azure App Service (Web App)
- **Database (PostgreSQL)** → Azure Database for PostgreSQL Flexible Server

## Prerequisites

1. **Azure Account**: Sign up at https://azure.microsoft.com/free/
2. **Azure CLI**: Install from https://learn.microsoft.com/cli/azure/install-azure-cli-windows

## Step 1: Install Azure CLI

Download and install: https://aka.ms/installazurecliwindows

After installation, restart PowerShell and verify:
```powershell
az --version
```

## Step 2: Login to Azure

```powershell
az login
```

This will open a browser for authentication.

## Step 3: Create Resource Group

```powershell
# Set variables
$RESOURCE_GROUP="uruhu-ppm-rg"
$LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION
```

## Step 4: Deploy PostgreSQL Database

```powershell
$DB_SERVER_NAME="uruhu-ppm-db-server"
$DB_ADMIN_USER="ppmadmin"
$DB_ADMIN_PASSWORD="YourSecurePassword123!"  # Change this!
$DB_NAME="uruhu_ppm"

# Create PostgreSQL Flexible Server
az postgres flexible-server create `
  --name $DB_SERVER_NAME `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --admin-user $DB_ADMIN_USER `
  --admin-password $DB_ADMIN_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 16 `
  --storage-size 32 `
  --public-access 0.0.0.0-255.255.255.255

# Create database
az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER_NAME `
  --database-name $DB_NAME
```

**Get connection string:**
```powershell
$DB_HOST = az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_SERVER_NAME --query "fullyQualifiedDomainName" -o tsv
Write-Host "Database Connection String:"
Write-Host "postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"
```

## Step 5: Deploy Backend (Azure App Service)

### 5.1 Create App Service Plan

```powershell
$APP_SERVICE_PLAN="uruhu-ppm-plan"
$BACKEND_APP_NAME="uruhu-ppm-backend"  # Must be globally unique

az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku B1 `
  --is-linux
```

### 5.2 Create Web App

```powershell
az webapp create `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --runtime "NODE:20-lts"
```

### 5.3 Configure Environment Variables

```powershell
# Get database connection string
$DATABASE_URL = "postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=require"

az webapp config appsettings set `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    DATABASE_URL="$DATABASE_URL" `
    NODE_ENV="production" `
    PORT="8080" `
    CORS_ORIGIN="https://${BACKEND_APP_NAME}.azurewebsites.net"
```

### 5.4 Prepare Backend for Deployment

Create a deployment script in your project root:

**deploy-backend.sh** (for Git Bash or WSL):
```bash
#!/bin/bash
cd server
npm install --production
npm run build
```

Or configure for zip deployment:

```powershell
# Create deployment package
cd "c:\Users\nehak\Uruhu PPM Tool\server"
npm install --production
npm run build

# Create zip file (requires 7zip or similar)
Compress-Archive -Path .\* -DestinationPath ..\backend-deploy.zip -Force
cd ..

# Deploy to Azure
az webapp deployment source config-zip `
  --resource-group $RESOURCE_GROUP `
  --name $BACKEND_APP_NAME `
  --src backend-deploy.zip
```

### 5.5 Run Database Migrations

After deployment, use the Kudu console or SSH to run:
```bash
npm run db:push
npm run db:seed
```

Or set up a post-deployment script.

## Step 6: Deploy Frontend (Azure Static Web Apps)

### 6.1 Build Frontend

```powershell
cd "c:\Users\nehak\Uruhu PPM Tool"
npm run build
```

### 6.2 Create Static Web App

```powershell
$STATIC_APP_NAME="uruhu-ppm-frontend"

az staticwebapp create `
  --name $STATIC_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --source https://github.com/nehakuchipudi/Uruhu-PPM-Tool `
  --branch main `
  --app-location "/" `
  --output-location "dist" `
  --login-with-github
```

### 6.3 Configure API Endpoint

Update your frontend code to use the Azure backend URL:

Create `.env.production`:
```
VITE_API_URL=https://uruhu-ppm-backend.azurewebsites.net/api
```

Update your API calls to use:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

## Step 7: Configure CORS

Update CORS settings in your backend to allow the Static Web App:

```powershell
# Get Static Web App URL
$FRONTEND_URL = az staticwebapp show --name $STATIC_APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostname" -o tsv

# Update backend CORS
az webapp config appsettings set `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings CORS_ORIGIN="https://$FRONTEND_URL"
```

## Step 8: Enable Custom Domain (Optional)

### For Static Web App:
```powershell
az staticwebapp hostname set `
  --name $STATIC_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --hostname your-domain.com
```

### For App Service:
```powershell
az webapp config hostname add `
  --webapp-name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --hostname api.your-domain.com
```

## Step 9: Monitor and Logs

### View Backend Logs:
```powershell
az webapp log tail `
  --name $BACKEND_APP_NAME `
  --resource-group $RESOURCE_GROUP
```

### View Database Metrics:
```powershell
az postgres flexible-server show `
  --resource-group $RESOURCE_GROUP `
  --name $DB_SERVER_NAME
```

## Alternative: Deploy with GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

env:
  AZURE_WEBAPP_NAME: uruhu-ppm-backend
  NODE_VERSION: '20.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install dependencies
        run: |
          cd server
          npm ci
          npm run build
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./server
```

## Useful Commands

### Restart Backend:
```powershell
az webapp restart --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP
```

### Delete All Resources:
```powershell
az group delete --name $RESOURCE_GROUP --yes
```

### View Resource Costs:
```powershell
az consumption usage list --resource-group $RESOURCE_GROUP
```

## Estimated Costs

- **PostgreSQL Flexible Server (B1ms)**: ~$12/month
- **App Service (B1)**: ~$13/month
- **Static Web Apps**: Free tier (includes 100GB bandwidth)

**Total**: ~$25/month for development/small production

## Troubleshooting

### Backend won't start:
1. Check logs: `az webapp log tail`
2. Verify environment variables
3. Check Node.js version compatibility

### Database connection fails:
1. Verify firewall rules
2. Check connection string
3. Enable SSL mode

### Frontend can't connect to backend:
1. Check CORS settings
2. Verify API URL in frontend
3. Check network security groups

## Security Best Practices

1. **Use Azure Key Vault** for secrets
2. **Enable Azure AD authentication**
3. **Set up Private Endpoints** for database
4. **Configure SSL/TLS** certificates
5. **Enable Application Insights** for monitoring

## Next Steps

After deployment:
1. Set up CI/CD with GitHub Actions
2. Configure custom domains
3. Enable monitoring and alerts
4. Set up automated backups
5. Implement staging environment

## Resources

- [Azure Portal](https://portal.azure.com)
- [Azure CLI Docs](https://learn.microsoft.com/cli/azure/)
- [Azure Static Web Apps Docs](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure App Service Docs](https://learn.microsoft.com/azure/app-service/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/azure/postgresql/)
