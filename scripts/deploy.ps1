# CredLayer Deployment Script (Windows PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Network = "devnet"
)

Write-Host "CredLayer - Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deploying to: $Network" -ForegroundColor Yellow

# Configure Solana cluster
switch ($Network) {
    "localnet" {
        solana config set --url localhost
    }
    "devnet" {
        solana config set --url devnet
    }
    "mainnet" {
        solana config set --url mainnet-beta
        Write-Host "[!] WARNING: Deploying to MAINNET!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    default {
        Write-Host "[X] Invalid network. Use: localnet, devnet, or mainnet" -ForegroundColor Red
        exit 1
    }
}

# Check balance
Write-Host ""
Write-Host "Checking balance..." -ForegroundColor Yellow
$balanceOutput = solana balance
$balance = [decimal]($balanceOutput -replace '[^\d.]', '')

Write-Host "Current balance: $balance SOL" -ForegroundColor Cyan

if ($balance -lt 2) {
    Write-Host "[!] Low balance! You may need more SOL for deployment." -ForegroundColor Yellow
    if ($Network -eq "devnet") {
        Write-Host "Requesting airdrop..." -ForegroundColor Yellow
        try {
            solana airdrop 2
        } catch {
            Write-Host "Airdrop failed. Please fund your wallet manually." -ForegroundColor Red
        }
    }
}

# Build the program
Write-Host ""
Write-Host "Building program..." -ForegroundColor Yellow
anchor build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build failed!" -ForegroundColor Red
    exit 1
}

# Get program ID
Write-Host ""
Write-Host "Getting Program ID..." -ForegroundColor Yellow
$programKeypairPath = "target\deploy\credlayer-keypair.json"

if (Test-Path $programKeypairPath) {
    $programId = solana address -k $programKeypairPath
    Write-Host "Program ID: $programId" -ForegroundColor Cyan
    
    # Update Anchor.toml with program ID
    Write-Host ""
    Write-Host "Updating Anchor.toml..." -ForegroundColor Yellow
    $anchorToml = Get-Content "Anchor.toml" -Raw
    $anchorToml = $anchorToml -replace 'credlayer = ".*"', "credlayer = `"$programId`""
    Set-Content "Anchor.toml" -Value $anchorToml
} else {
    Write-Host "[!] Program keypair not found. Using existing Program ID from Anchor.toml" -ForegroundColor Yellow
}

# Deploy
Write-Host ""
Write-Host "Deploying program..." -ForegroundColor Yellow
anchor deploy --provider.cluster $Network

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Deployment failed!" -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host ""
Write-Host "Verifying deployment..." -ForegroundColor Yellow
if ($programId) {
    solana program show $programId
}

Write-Host ""
Write-Host "[OK] Deployment complete!" -ForegroundColor Green
Write-Host "Program ID: $programId" -ForegroundColor Cyan
Write-Host "Network: $Network" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your frontend with the new program ID" -ForegroundColor White
Write-Host "2. Initialize reputation accounts for wallets" -ForegroundColor White
Write-Host "3. Test the integration" -ForegroundColor White
