# 🎉 Azure Deployment Status

## ✅ Successfully Deployed Components

### Frontend - Azure Static Web App
- **Status**: ✅ DEPLOYED
- **URL**: https://red-coast-048d6d21e.1.azurestaticapps.net
- **Resource Group**: uruhu-ppm-rg
- **Location**: Global (CDN distributed)
- **SKU**: Free tier
- **Build Configuration**: Vite with automatic builds
- **Deployment Method**: Azure Static Web Apps CLI

## ⚠️ Pending Components

### Backend API
- **Status**: ⏸️ PENDING - Quota Limitation
- **Issue**: Azure subscription has 0 quota for App Service VMs (both Free and Basic tiers)
- **Resolution Required**: Request quota increase from Azure Portal

### Database
- **Status**: ⏸️ PENDING
- **Service**: Azure Database for PostgreSQL Flexible Server
- **Dependency**: PostgreSQL provider registration is in progress

## 📋 What Was Created

1. **Resource Group**: `uruhu-ppm-rg` (East US)
2. **Static Web App**: `uruhu-ppm-tool`
3. **SWA Configuration**: `swa-cli.config.json`
4. **Backend Package**: `server/package.json`
5. **Azure Config Files**: `server/web.config`, `server/startup.js`

## 🚀 Next Steps to Complete Deployment

### Option 1: Request Quota Increase (Recommended for Production)

1. **Request App Service Quota:**
   - Go to: https://portal.azure.com
   - Navigate to: Subscriptions → Your Subscription → Usage + quotas
   - Search for "App Service"
   - Request quota increase for:
     - Free VMs: Request at least 1
     - Basic VMs: Request at least 1 (for production)
   - Location: West US 2
   - Processing time: Usually 1-2 business days

2. **Once Quota is Approved, Run:**
   ```powershell
   # Create App Service Plan
   az appservice plan create `
     --name uruhu-ppm-plan `
     --resource-group uruhu-ppm-rg `
     --location westus2 `
     --sku B1 `
     --is-linux

   # Create Web App
   $BACKEND_APP_NAME="uruhu-ppm-backend-$(Get-Random -Minimum 1000 -Maximum 9999)"
   az webapp create `
     --name $BACKEND_APP_NAME `
     --resource-group uruhu-ppm-rg `
     --plan uruhu-ppm-plan `
     --runtime "NODE:18-lts"

   # Deploy backend
   cd server
   npm install
   npm run build
   Compress-Archive -Path * -DestinationPath ../backend-deploy.zip
   cd ..
   
   az webapp deploy `
     --name $BACKEND_APP_NAME `
     --resource-group uruhu-ppm-rg `
     --src-path backend-deploy.zip `
     --type zip
   ```

### Option 2: Use Azure Container Instances (Alternative)

If quota issues persist, use Azure Container Instances (no VM quota required):

```powershell
# Build and push container (requires Docker Desktop)
docker build -t uruhu-backend ./server
az acr create --resource-group uruhu-ppm-rg --name uruhuppmacr --sku Basic
az acr login --name uruhuppmacr
docker tag uruhu-backend uruhuppmacr.azurecr.io/uruhu-backend:latest
docker push uruhuppmacr.azurecr.io/uruhu-backend:latest

# Deploy as container instance
az container create `
  --resource-group uruhu-ppm-rg `
  --name uruhu-ppm-backend `
  --image uruhuppmacr.azurecr.io/uruhu-backend:latest `
  --dns-name-label uruhu-ppm-api `
  --ports 8080
```

### Option 3: Use Static Web Apps Managed Functions (Free)

Convert your Express backend to Azure Functions (included free with Static Web Apps):

1. **Create Azure Functions API:**
   ```powershell
   cd "c:\Users\nehak\Uruhu PPM Tool"
   mkdir api
   cd api
   func init --worker-runtime node --model V4
   ```

2. **Convert Express routes to Azure Functions** (one HTTP trigger per route)

3. **Deploy with Static Web App:**
   ```powershell
   npx swa deploy --env production
   ```

### Database Setup (All Options)

Once backend solution is chosen:

```powershell
# Check if provider is registered
az provider show --namespace Microsoft.DBforPostgreSQL --query "registrationState"

# Create PostgreSQL server
$DB_SERVER_NAME="uruhu-ppm-db-$(Get-Random -Minimum 1000 -Maximum 9999)"
$DB_ADMIN_PASSWORD="SecurePass$(Get-Random -Minimum 100 -Maximum 999)!"

az postgres flexible-server create `
  --name $DB_SERVER_NAME `
  --resource-group uruhu-ppm-rg `
  --location westus2 `
  --admin-user ppmadmin `
  --admin-password $DB_ADMIN_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --version 16 `
  --storage-size 32 `
  --public-access 0.0.0.0

# Get connection string
$DB_HOST = az postgres flexible-server show `
  --resource-group uruhu-ppm-rg `
  --name $DB_SERVER_NAME `
  --query "fullyQualifiedDomainName" -o tsv

Write-Host "Database URL: postgresql://ppmadmin:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/postgres?sslmode=require"

# Run migrations
cd prisma
$env:DATABASE_URL="postgresql://ppmadmin:${DB_ADMIN_PASSWORD}@${DB_HOST}:5432/postgres?sslmode=require"
npx prisma migrate deploy
npx prisma db seed
```

## 🔗 Connect Frontend to Backend

Once backend is deployed, update the frontend API configuration:

1. **Create environment file:**
   ```env
   # .env.production
   VITE_API_URL=https://<your-backend-url>
   ```

2. **Update API calls to use environment variable**

3. **Rebuild and redeploy frontend:**
   ```powershell
   npm run build
   npx swa deploy --env production
   ```

## 📊 Current Resource URLs

- **Frontend**: https://red-coast-048d6d21e.1.azurestaticapps.net
- **Azure Portal**: https://portal.azure.com
- **Resource Group**: [View in Portal](https://portal.azure.com/#@/resource/subscriptions/b2369ef3-9576-40c4-8006-64fc6237e155/resourceGroups/uruhu-ppm-rg/overview)

## 💰 Estimated Costs

- **Static Web App**: $0/month (Free tier)
- **App Service B1**: ~$13/month (when quota available)
- **PostgreSQL Standard_B1ms**: ~$12/month
- **Total**: ~$25/month

Alternative with Managed Functions:
- **Static Web App + Functions**: $0/month (Free tier with usage limits)
- **PostgreSQL**: ~$12/month
- **Total**: ~$12/month

## 📝 Recommendations

1. **Immediate**: Request App Service quota increase via Azure Portal
2. **Short-term**: Consider Option 3 (Managed Functions) for fastest deployment
3. **Long-term**: Use App Service (Option 1) for better control and scalability
4. **Security**: Enable Application Insights, Key Vault for secrets, and Private Endpoints

## 🆘 Troubleshooting

### Quota Issues
- Visit Azure Portal → Subscriptions → Usage + quotas
- Search for "App Service" or "Compute"
- Request increase for your region

### PostgreSQL Provider Registration
Check status:
```powershell
az provider show --namespace Microsoft.DBforPostgreSQL --query "registrationState"
```

If still "Registering", wait a few minutes and check again.

## 📚 Documentation Links

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Request Quota Increase](https://learn.microsoft.com/en-us/azure/azure-portal/supportability/regional-quota-requests)
- [Azure Functions in Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/add-api)
- [Link App Service to Static Web App](https://learn.microsoft.com/en-us/azure/static-web-apps/apis-app-service)

---

**Deployment initiated**: January 27, 2026
**Frontend deployment**: ✅ Complete
**Backend deployment**: ⏸️ Awaiting quota approval
