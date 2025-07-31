# Firebase Notification Troubleshooting Script
# PowerShell script to help diagnose Firebase notification issues

Write-Host "🔥 Firebase Notification Troubleshooting Tool" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# Check if we're in the right directory
$serverPath = ".\Newsite-Server"
$clientPath = ".\client\news-moty"

if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $clientPath)) {
    Write-Host "❌ Client directory not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found server and client directories" -ForegroundColor Green

# Function to start the server
function Start-Server {
    Write-Host "🚀 Starting .NET server..." -ForegroundColor Cyan
    Set-Location $serverPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"
    Set-Location ..
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Function to test server
function Test-Server {
    Write-Host "🔍 Testing server connectivity..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:7030/api/Notifications/diagnose-firebase" -Method POST -SkipCertificateCheck -ErrorAction Stop
        Write-Host "✅ Server is responding!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to open diagnostic tools
function Open-DiagnosticTools {
    Write-Host "🔧 Opening diagnostic tools..." -ForegroundColor Cyan
    
    $diagnosticUrl = "file:///$((Get-Location).Path.Replace('\', '/'))/$clientPath/firebase-diagnostic-tool.html"
    $quickTestUrl = "file:///$((Get-Location).Path.Replace('\', '/'))/$clientPath/firebase-quick-test.html"
    
    Write-Host "📋 Diagnostic Tool: $diagnosticUrl" -ForegroundColor Blue
    Write-Host "⚡ Quick Test: $quickTestUrl" -ForegroundColor Blue
    
    Start-Process $diagnosticUrl
    Start-Process $quickTestUrl
}

# Function to show common issues and solutions
function Show-CommonIssues {
    Write-Host ""
    Write-Host "🔍 Common Firebase Notification Issues and Solutions:" -ForegroundColor Yellow
    Write-Host "=====================================================" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "1. 404 Errors from Firebase:" -ForegroundColor Cyan
    Write-Host "   - Check if FCM API is enabled in Google Cloud Console"
    Write-Host "   - Verify Firebase project exists and is active"
    Write-Host "   - Ensure service account has proper permissions"
    
    Write-Host ""
    Write-Host "2. No FCM Tokens in Database:" -ForegroundColor Cyan
    Write-Host "   - Users need to grant notification permission in browser"
    Write-Host "   - Service worker must be registered properly"
    Write-Host "   - VAPID key must be valid"
    
    Write-Host ""
    Write-Host "3. Service Worker Issues:" -ForegroundColor Cyan
    Write-Host "   - Check if firebase-messaging-sw.js is accessible"
    Write-Host "   - Verify service worker registration in browser dev tools"
    Write-Host "   - Clear browser cache and re-register"
    
    Write-Host ""
    Write-Host "4. Invalid/Expired Tokens:" -ForegroundColor Cyan
    Write-Host "   - Use the cleanup endpoint to remove invalid tokens"
    Write-Host "   - Check token statistics to see current state"
    Write-Host "   - Users may need to re-subscribe to notifications"
}

# Main menu
do {
    Write-Host ""
    Write-Host "📋 What would you like to do?" -ForegroundColor Yellow
    Write-Host "1. Start server and test connectivity"
    Write-Host "2. Test server connectivity (if already running)"
    Write-Host "3. Open diagnostic tools in browser"
    Write-Host "4. Show common issues and solutions"
    Write-Host "5. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-5)"
    
    switch ($choice) {
        "1" {
            Start-Server
            if (Test-Server) {
                Write-Host "🎉 Server is running and responsive!" -ForegroundColor Green
                Open-DiagnosticTools
            } else {
                Write-Host "⚠️ Server started but not responding. Check the server console for errors." -ForegroundColor Yellow
            }
        }
        "2" {
            Test-Server
        }
        "3" {
            Open-DiagnosticTools
        }
        "4" {
            Show-CommonIssues
        }
        "5" {
            Write-Host "👋 Goodbye!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "❌ Invalid choice. Please enter 1-5." -ForegroundColor Red
        }
    }
} while ($choice -ne "5")
