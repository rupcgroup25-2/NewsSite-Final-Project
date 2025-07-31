# Firebase API Status Checker
# This script checks the status of Firebase APIs in Google Cloud Console

Write-Host "🔥 Firebase API Status Checker" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

$projectId = "newspapersite-ruppin"

Write-Host "📋 Project ID: $projectId" -ForegroundColor Cyan

# Function to check if gcloud CLI is installed
function Test-GCloudCLI {
    try {
        $version = gcloud --version 2>$null
        if ($version) {
            Write-Host "✅ Google Cloud CLI is installed" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Google Cloud CLI is not installed" -ForegroundColor Red
        Write-Host "📥 Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Blue
        return $false
    }
    return $false
}

# Function to check API status using gcloud
function Check-APIStatus {
    param($apiName, $apiId)
    
    try {
        Write-Host "🔍 Checking $apiName..." -ForegroundColor Cyan
        
        $result = gcloud services list --enabled --filter="name:$apiId" --format="value(name)" --project=$projectId 2>$null
        
        if ($result -and $result.Contains($apiId)) {
            Write-Host "  ✅ $apiName is ENABLED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ $apiName is NOT ENABLED" -ForegroundColor Red
            Write-Host "  🔧 Enable with: gcloud services enable $apiId --project=$projectId" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "  ⚠️ Could not check $apiName status" -ForegroundColor Yellow
        return $false
    }
}

# Function to check project billing
function Check-BillingStatus {
    try {
        Write-Host "🔍 Checking billing status..." -ForegroundColor Cyan
        
        $billingInfo = gcloud billing projects describe $projectId --format="value(billingEnabled)" 2>$null
        
        if ($billingInfo -eq "True") {
            Write-Host "  ✅ Billing is ENABLED" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ Billing is NOT ENABLED" -ForegroundColor Red
            Write-Host "  🔧 Enable billing at: https://console.cloud.google.com/billing?project=$projectId" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "  ⚠️ Could not check billing status" -ForegroundColor Yellow
        return $false
    }
}

# Function to check service account
function Check-ServiceAccount {
    param($serviceAccountEmail)
    
    try {
        Write-Host "🔍 Checking service account: $serviceAccountEmail" -ForegroundColor Cyan
        
        $result = gcloud iam service-accounts describe $serviceAccountEmail --project=$projectId 2>$null
        
        if ($result) {
            Write-Host "  ✅ Service account exists and is accessible" -ForegroundColor Green
            
            # Check roles
            $roles = gcloud projects get-iam-policy $projectId --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:$serviceAccountEmail" 2>$null
            
            if ($roles) {
                Write-Host "  📋 Service account roles:" -ForegroundColor Cyan
                Write-Host $roles -ForegroundColor White
            }
            
            return $true
        } else {
            Write-Host "  ❌ Service account not found or not accessible" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  ⚠️ Could not check service account" -ForegroundColor Yellow
        return $false
    }
}

# Main execution
Write-Host ""

# Check if gcloud CLI is available
if (-not (Test-GCloudCLI)) {
    Write-Host ""
    Write-Host "❌ Cannot check API status without Google Cloud CLI" -ForegroundColor Red
    Write-Host "📋 Manual check instructions:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://console.cloud.google.com/apis/dashboard?project=$projectId" -ForegroundColor Blue
    Write-Host "   2. Look for these APIs in the enabled list:" -ForegroundColor Blue
    Write-Host "      - Firebase Cloud Messaging API" -ForegroundColor Blue
    Write-Host "      - Firebase Management API" -ForegroundColor Blue
    Write-Host "      - Cloud Resource Manager API" -ForegroundColor Blue
    Write-Host "   3. Check billing: https://console.cloud.google.com/billing?project=$projectId" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🔧 Quick fix links:" -ForegroundColor Yellow
    Write-Host "   FCM API: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=$projectId" -ForegroundColor Blue
    Write-Host "   Firebase API: https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=$projectId" -ForegroundColor Blue
    exit
}

Write-Host "🔧 Checking Google Cloud authentication..." -ForegroundColor Cyan
try {
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $projectId) {
        Write-Host "⚠️ Current project: $currentProject, switching to $projectId" -ForegroundColor Yellow
        gcloud config set project $projectId
    }
} catch {
    Write-Host "⚠️ Please authenticate with: gcloud auth login" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Checking required APIs..." -ForegroundColor Yellow

# Check each required API
$apiResults = @{}
$apiResults["FCM"] = Check-APIStatus "Firebase Cloud Messaging API" "fcm.googleapis.com"
$apiResults["Firebase"] = Check-APIStatus "Firebase Management API" "firebase.googleapis.com"
$apiResults["ResourceManager"] = Check-APIStatus "Cloud Resource Manager API" "cloudresourcemanager.googleapis.com"
$apiResults["IAM"] = Check-APIStatus "Identity and Access Management API" "iam.googleapis.com"

Write-Host ""
$billingOk = Check-BillingStatus

Write-Host ""
$serviceAccountEmail = "firebase-adminsdk-fbsvc@newspapersite-ruppin.iam.gserviceaccount.com"
$serviceAccountOk = Check-ServiceAccount $serviceAccountEmail

Write-Host ""
Write-Host "📊 SUMMARY" -ForegroundColor Yellow
Write-Host "==========" -ForegroundColor Yellow

$allAPIsOk = $apiResults.Values -notcontains $false
$overallStatus = $allAPIsOk -and $billingOk -and $serviceAccountOk

if ($overallStatus) {
    Write-Host "✅ All checks passed! FCM should be working." -ForegroundColor Green
} else {
    Write-Host "❌ Issues found that need attention:" -ForegroundColor Red
    
    if (-not $allAPIsOk) {
        Write-Host "   🔧 Some APIs are not enabled" -ForegroundColor Yellow
    }
    if (-not $billingOk) {
        Write-Host "   💳 Billing needs to be enabled" -ForegroundColor Yellow
    }
    if (-not $serviceAccountOk) {
        Write-Host "   🔑 Service account issues detected" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🚀 Quick fix commands:" -ForegroundColor Cyan
    Write-Host "gcloud services enable fcm.googleapis.com firebase.googleapis.com cloudresourcemanager.googleapis.com iam.googleapis.com --project=$projectId"
}

Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Blue
Write-Host "   Firebase Console: https://console.firebase.google.com/project/$projectId" -ForegroundColor Blue
Write-Host "   APIs Dashboard: https://console.cloud.google.com/apis/dashboard?project=$projectId" -ForegroundColor Blue
Write-Host "   Billing: https://console.cloud.google.com/billing?project=$projectId" -ForegroundColor Blue
Write-Host "   IAM: https://console.cloud.google.com/iam-admin/iam?project=$projectId" -ForegroundColor Blue
