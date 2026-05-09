import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Credlayer } from "../target/types/credlayer";
import { expect } from "chai";

describe("credlayer", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Credlayer as Program<Credlayer>;
  
  // Test wallet
  const testWallet = anchor.web3.Keypair.generate();
  
  // Authority (program deployer)
  const authority = provider.wallet;
  
  // PDA for reputation account
  let reputationPda: anchor.web3.PublicKey;
  let reputationBump: number;

  before(async () => {
    // Derive PDA
    [reputationPda, reputationBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reputation"), testWallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes a reputation account", async () => {
    const initialScore = 75;

    const tx = await program.methods
      .initializeReputation(initialScore)
      .accounts({
        reputation: reputationPda,
        wallet: testWallet.publicKey,
        authority: authority.publicKey,
        payer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize transaction signature:", tx);

    // Fetch the account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify initialization
    expect(reputationAccount.wallet.toString()).to.equal(testWallet.publicKey.toString());
    expect(reputationAccount.authority.toString()).to.equal(authority.publicKey.toString());
    expect(reputationAccount.trustScore).to.equal(initialScore);
    expect(reputationAccount.confidence).to.equal(5000); // 50%
    expect(reputationAccount.updateCount.toNumber()).to.equal(0);
    expect(reputationAccount.activeFlagsCount).to.equal(0);
    expect(reputationAccount.bump).to.equal(reputationBump);
  });

  it("Updates reputation score", async () => {
    const newScore = 85;
    const riskLevel = { highlyTrusted: {} };
    const confidence = 9000; // 90%

    const tx = await program.methods
      .updateReputation(newScore, riskLevel, confidence)
      .accounts({
        reputation: reputationPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Update transaction signature:", tx);

    // Fetch the updated account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify update
    expect(reputationAccount.trustScore).to.equal(newScore);
    expect(reputationAccount.confidence).to.equal(confidence);
    expect(reputationAccount.updateCount.toNumber()).to.equal(1);
  });

  it("Adds a behavioral metric", async () => {
    const metricType = { behavioralStability: {} };
    const value = 92;

    const tx = await program.methods
      .addMetric(metricType, value)
      .accounts({
        reputation: reputationPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Add metric transaction signature:", tx);

    // Fetch the updated account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify metric was added
    const addedMetric = reputationAccount.metrics.find(
      (m: any) => m.metricType.behavioralStability !== undefined
    );
    expect(addedMetric).to.not.be.undefined;
    expect(addedMetric.value).to.equal(value);
  });

  it("Adds a risk flag", async () => {
    const flag = { newWallet: {} };

    const tx = await program.methods
      .addRiskFlag(flag)
      .accounts({
        reputation: reputationPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Add risk flag transaction signature:", tx);

    // Fetch the updated account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify flag was added
    expect(reputationAccount.activeFlagsCount).to.equal(1);
    const hasFlag = reputationAccount.riskFlags.some(
      (f: any) => f.newWallet !== undefined
    );
    expect(hasFlag).to.be.true;
  });

  it("Removes a risk flag", async () => {
    const flag = { newWallet: {} };

    const tx = await program.methods
      .removeRiskFlag(flag)
      .accounts({
        reputation: reputationPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Remove risk flag transaction signature:", tx);

    // Fetch the updated account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify flag was removed
    expect(reputationAccount.activeFlagsCount).to.equal(0);
  });

  it("Adds multiple metrics", async () => {
    const metrics = [
      { type: { transactionDiversity: {} }, value: 88 },
      { type: { counterpartyQuality: {} }, value: 76 },
      { type: { sybilResistance: {} }, value: 95 },
    ];

    for (const metric of metrics) {
      await program.methods
        .addMetric(metric.type, metric.value)
        .accounts({
          reputation: reputationPda,
          authority: authority.publicKey,
        })
        .rpc();
    }

    // Fetch the updated account
    const reputationAccount = await program.account.reputationAccount.fetch(reputationPda);

    // Verify all metrics were added
    const nonEmptyMetrics = reputationAccount.metrics.filter(
      (m: any) => m.metricType.none === undefined
    );
    expect(nonEmptyMetrics.length).to.be.at.least(metrics.length);
  });

  it("Fails to update with invalid score", async () => {
    const invalidScore = 150; // > 100
    const riskLevel = { highlyTrusted: {} };
    const confidence = 9000;

    try {
      await program.methods
        .updateReputation(invalidScore, riskLevel, confidence)
        .accounts({
          reputation: reputationPda,
          authority: authority.publicKey,
        })
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.toString()).to.include("InvalidTrustScore");
    }
  });

  it("Fails to update with unauthorized signer", async () => {
    const unauthorizedUser = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL to the unauthorized user
    const airdropSig = await provider.connection.requestAirdrop(
      unauthorizedUser.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    try {
      await program.methods
        .updateReputation(80, { trusted: {} }, 8000)
        .accounts({
          reputation: reputationPda,
          authority: unauthorizedUser.publicKey,
        })
        .signers([unauthorizedUser])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.toString()).to.include("Unauthorized");
    }
  });

  it("Closes the reputation account", async () => {
    const tx = await program.methods
      .closeReputation()
      .accounts({
        reputation: reputationPda,
        authority: authority.publicKey,
      })
      .rpc();

    console.log("Close transaction signature:", tx);

    // Verify account is closed
    try {
      await program.account.reputationAccount.fetch(reputationPda);
      expect.fail("Account should be closed");
    } catch (error) {
      expect(error.toString()).to.include("Account does not exist");
    }
  });
});
