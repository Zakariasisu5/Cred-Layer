# CredLayer Solana Development Environment Setup Script (Windows PowerShell)

Write-Host "CredLayer - Solana Development Environment Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
Write-Host "Checking for Rust installation..." -ForegroundColor Yellow
$rustInstalled = Get-Command rustc -ErrorAction SilentlyContinue
if (-not $rustInstalled) {
    Write-Host "[X] Rust is not installed. Installing Rust..." -ForegroundColor Red
    Write-Host "Please visit: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "Download and run rustup-init.exe, then restart this script." -ForegroundColor Yellow
    Start-Process "https://rustup.rs/"
    exit 1
} else {
    $rustVersion = rustc --version
    Write-Host "[OK] Rust is already installed: $rustVersion" -ForegroundColor Green
}

# Update Rust
Write-Host ""
Write-Host "Updating Rust..." -ForegroundColor Yellow
rustup update

# Install Solana CLI
Write-Host ""
Write-Host "Checking for Solana CLI..." -ForegroundColor Yellow
$solanaInstalled = Get-Command solana -ErrorAction SilentlyContinue
if (-not $solanaInstalled) {
    Write-Host "[X] Solana CLI is not installed. Installing Solana CLI..." -ForegroundColor Red
    Write-Host "Downloading Solana installer..." -ForegroundColor Yellow
    
    # Download and install Solana
    $solanaInstaller = "$env:TEMP\solana-install-init.exe"
    Invoke-WebRequest -Uri "https://release.solana.com/stable/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile $solanaInstaller
    
    Write-Host "Running Solana installer..." -ForegroundColor Yellow
    Start-Process -FilePath $solanaInstaller -Wait
    
    # Add to PATH
    $solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
    $env:Path = $env:Path + ";" + $solanaPath
    
    Write-Host "[OK] Solana CLI installed. Please restart your terminal." -ForegroundColor Green
} else {
    $solanaVersion = solana --version
    Write-Host "[OK] Solana CLI is already installed: $solanaVersion" -ForegroundColor Green
}

# Install Anchor
Write-Host ""
Write-Host "Checking for Anchor..." -ForegroundColor Yellow
$anchorInstalled = Get-Command anchor -ErrorAction SilentlyContinue
if (-not $anchorInstalled) {
    Write-Host "[X] Anchor is not installed. Installing Anchor..." -ForegroundColor Red
    Write-Host "Installing AVM (Anchor Version Manager)..." -ForegroundColor Yellow
    
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    
    Write-Host "Installing latest Anchor version..." -ForegroundColor Yellow
    avm install latest
    avm use latest
    
    Write-Host "[OK] Anchor installed" -ForegroundColor Green
} else {
    $anchorVersion = anchor --version
    Write-Host "[OK] Anchor is already installed: $anchorVersion" -ForegroundColor Green
}

# Configure Solana for devnet
Write-Host ""
Write-Host "Configuring Solana for devnet..." -ForegroundColor Yellow
solana config set --url devnet

# Generate a new keypair if it doesn't exist
$keypairPath = "$env:USERPROFILE\.config\solana\id.json"
if (-not (Test-Path $keypairPath)) {
    Write-Host "Generating new Solana keypair..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.config\solana" | Out-Null
    solana-keygen new --no-bip39-passphrase --outfile $keypairPath
} else {
    Write-Host "[OK] Solana keypair already exists" -ForegroundColor Green
}

# Show wallet address
Write-Host ""
Write-Host "Your wallet address:" -ForegroundColor Cyan
solana address

# Airdrop SOL for testing (devnet only)
Write-Host ""
Write-Host "Requesting airdrop (2 SOL)..." -ForegroundColor Yellow
try {
    solana airdrop 2
} catch {
    Write-Host "[!] Airdrop failed (rate limit or network issue). Try again later." -ForegroundColor Yellow
}

# Check balance
Write-Host ""
Write-Host "Current balance:" -ForegroundColor Cyan
solana balance

# Install Node dependencies
Write-Host ""
if (Test-Path "package.json") {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "[OK] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build the program: anchor build" -ForegroundColor White
Write-Host "2. Run tests: anchor test" -ForegroundColor White
Write-Host "3. Deploy to devnet: anchor deploy" -ForegroundColor White
Write-Host ""
Write-Host "Happy building with CredLayer!" -ForegroundColor Cyan
