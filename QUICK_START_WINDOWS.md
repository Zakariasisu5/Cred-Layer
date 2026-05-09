# 🚀 Quick Start - Windows Installation

Simple step-by-step guide to get CredLayer running on Windows.

---

## Step 1: Install Rust (5 minutes)

1. Go to https://rustup.rs/
2. Download `rustup-init.exe`
3. Run the installer
4. Press Enter to proceed with default installation
5. **Close and reopen your terminal**
6. Verify: `rustc --version`

---

## Step 2: Install Solana CLI (5 minutes)

### Option A: Using PowerShell (Recommended)

```powershell
# Download installer
Invoke-WebRequest -Uri "https://release.solana.com/stable/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "$env:TEMP\solana-install.exe"

# Run installer
& "$env:TEMP\solana-install.exe"
```

### Option B: Manual Download

1. Go to https://github.com/solana-labs/solana/releases
2. Download `solana-install-init-x86_64-pc-windows-msvc.exe`
3. Run the installer
4. Follow the prompts

### Add Solana to PATH

**IMPORTANT**: After installation, add Solana to your PATH:

```powershell
# Add to current session
$env:Path += ";$env:USERPROFILE\.local\share\solana\install\active_release\bin"

# Add permanently (copy and paste this entire block)
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
if ($currentPath -notlike "*$solanaPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$solanaPath", "User")
}
```

**Close and reopen your terminal**, then verify:
```powershell
solana --version
```

---

## Step 3: Install Anchor (10-15 minutes)

```powershell
# Install AVM (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# This will take 10-15 minutes - be patient!
# You'll see "Compiling..." messages

# After installation completes, install Anchor
avm install latest
avm use latest

# Verify
anchor --version
```

---

## Step 4: Configure Solana

```powershell
# Set to devnet
solana config set --url devnet

# Create keypair (press Enter when asked for passphrase)
solana-keygen new

# Check your address
solana address

# Get free SOL for testing
solana airdrop 2

# Check balance
solana balance
```

---

## Step 5: Build CredLayer Smart Contract

```powershell
# Navigate to project directory
cd D:\projects\cred-layer-dashboard

# Build (first build takes 5-10 minutes)
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy
```

---

## ⚠️ Common Issues & Solutions

### Issue: "solana: command not found"

**Solution**: Solana is not in your PATH. Run this:

```powershell
# Add to PATH for current session
$env:Path += ";$env:USERPROFILE\.local\share\solana\install\active_release\bin"

# Then verify
solana --version
```

If it works, add it permanently:
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$solanaPath", "User")
```

**Then restart your terminal!**

### Issue: "anchor: command not found"

**Solution**: Anchor is not in your PATH. Run this:

```powershell
# Add Cargo bin to PATH
$env:Path += ";$env:USERPROFILE\.cargo\bin"

# Verify
anchor --version
```

If it works, add it permanently:
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cargoPath = "$env:USERPROFILE\.cargo\bin"
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$cargoPath", "User")
```

**Then restart your terminal!**

### Issue: "cargo install" is very slow

**Solution**: This is normal! The first time you install Anchor, it compiles everything from source. This takes 10-15 minutes. Just wait for it to complete.

### Issue: "Airdrop failed"

**Solution**: Devnet airdrops are rate-limited. Try again in a few minutes:

```powershell
solana airdrop 2
```

Or use the faucet: https://faucet.solana.com/

### Issue: Build fails with linker error

**Solution**: Install Visual Studio Build Tools

1. Download: https://visualstudio.microsoft.com/downloads/
2. Install "Desktop development with C++"
3. Restart terminal
4. Try building again

---

## ✅ Verification Checklist

After setup, verify everything:

```powershell
# Check Rust
rustc --version
# Should show: rustc 1.x.x

# Check Cargo
cargo --version
# Should show: cargo 1.x.x

# Check Solana
solana --version
# Should show: solana-cli 1.x.x

# Check Anchor
anchor --version
# Should show: anchor-cli 0.30.x

# Check balance
solana balance
# Should show: 2 SOL (or more)

# Check config
solana config get
# Should show: RPC URL: https://api.devnet.solana.com
```

If all commands work, you're ready to build!

---

## 🎯 Quick Commands

```powershell
# Build smart contract
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy

# Check balance
solana balance

# Get more SOL
solana airdrop 2

# View logs
solana logs

# Check program
solana program show <PROGRAM_ID>
```

---

## 🆘 Still Having Issues?

1. **Restart your terminal** - This fixes 90% of PATH issues
2. **Run as Administrator** - Some installations need admin rights
3. **Check antivirus** - Windows Defender might block installations
4. **Use WSL** - If Windows is too problematic, use WSL2:
   ```powershell
   wsl --install
   ```

---

## 📚 Next Steps

Once everything is installed:

1. ✅ Build: `anchor build`
2. ✅ Test: `anchor test`
3. ✅ Deploy: `anchor deploy`
4. ✅ Update frontend with Program ID
5. ✅ Test end-to-end

---

**Need help? Check [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed troubleshooting!**
