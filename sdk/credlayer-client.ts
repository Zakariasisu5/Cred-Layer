import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { Credlayer } from "../target/types/credlayer";
import idl from "../target/idl/credlayer.json";

export const PROGRAM_ID = new web3.PublicKey("CREDqKG3fc8RfScG8uEZP1WoqANgWNJ7o3KG9nfXdUs");
export const REPUTATION_SEED = "reputation";

export interface ReputationData {
  wallet: web3.PublicKey;
  authority: web3.PublicKey;
  trustScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  lastUpdated: number;
  createdAt: number;
  updateCount: number;
  metrics: Metric[];
  riskFlags: RiskFlag[];
  activeFlagsCount: number;
}

export enum RiskLevel {
  HighlyTrusted = "HighlyTrusted",
  Trusted = "Trusted",
  MediumRisk = "MediumRisk",
  HighRisk = "HighRisk",
}

export enum MetricType {
  None = "None",
  BehavioralStability = "BehavioralStability",
  TransactionDiversity = "TransactionDiversity",
  CounterpartyQuality = "CounterpartyQuality",
  SmartContractHygiene = "SmartContractHygiene",
  SybilResistance = "SybilResistance",
  RepaymentReliability = "RepaymentReliability",
}

export enum RiskFlag {
  None = "None",
  PotentialSybilCluster = "PotentialSybilCluster",
  AbnormalTransactionBurst = "AbnormalTransactionBurst",
  UnverifiedProgramInteraction = "UnverifiedProgramInteraction",
  LowProtocolDiversity = "LowProtocolDiversity",
  ElevatedFailureRate = "ElevatedFailureRate",
  NewWallet = "NewWallet",
  WeakRepaymentHistory = "WeakRepaymentHistory",
}

export interface Metric {
  metricType: MetricType;
  value: number;
}

export class CredLayerClient {
  program: Program<Credlayer>;
  provider: AnchorProvider;

  constructor(provider: AnchorProvider) {
    this.provider = provider;
    this.program = new Program(idl as Credlayer, provider);
  }

  /**
   * Get the PDA for a wallet's reputation account
   */
  getReputationPDA(wallet: web3.PublicKey): [web3.PublicKey, number] {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from(REPUTATION_SEED), wallet.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Initialize a reputation account for a wallet
   */
  async initializeReputation(
    wallet: web3.PublicKey,
    initialScore: number,
    authority: web3.PublicKey,
    payer: web3.PublicKey
  ): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const tx = await this.program.methods
      .initializeReputation(initialScore)
      .accounts({
        reputation: reputationPda,
        wallet: wallet,
        authority: authority,
        payer: payer,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Update reputation score for a wallet
   */
  async updateReputation(
    wallet: web3.PublicKey,
    newScore: number,
    riskLevel: RiskLevel,
    confidence: number
  ): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const riskLevelEnum = this.convertRiskLevel(riskLevel);

    const tx = await this.program.methods
      .updateReputation(newScore, riskLevelEnum, confidence)
      .accounts({
        reputation: reputationPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Add a behavioral metric
   */
  async addMetric(
    wallet: web3.PublicKey,
    metricType: MetricType,
    value: number
  ): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const metricTypeEnum = this.convertMetricType(metricType);

    const tx = await this.program.methods
      .addMetric(metricTypeEnum, value)
      .accounts({
        reputation: reputationPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Add a risk flag
   */
  async addRiskFlag(
    wallet: web3.PublicKey,
    flag: RiskFlag
  ): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const flagEnum = this.convertRiskFlag(flag);

    const tx = await this.program.methods
      .addRiskFlag(flagEnum)
      .accounts({
        reputation: reputationPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Remove a risk flag
   */
  async removeRiskFlag(
    wallet: web3.PublicKey,
    flag: RiskFlag
  ): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const flagEnum = this.convertRiskFlag(flag);

    const tx = await this.program.methods
      .removeRiskFlag(flagEnum)
      .accounts({
        reputation: reputationPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Get reputation data for a wallet
   */
  async getReputation(wallet: web3.PublicKey): Promise<ReputationData | null> {
    const [reputationPda] = this.getReputationPDA(wallet);

    try {
      const account = await this.program.account.reputationAccount.fetch(reputationPda);
      return this.parseReputationAccount(account);
    } catch (error) {
      // Account doesn't exist
      return null;
    }
  }

  /**
   * Check if a reputation account exists
   */
  async reputationExists(wallet: web3.PublicKey): Promise<boolean> {
    const reputation = await this.getReputation(wallet);
    return reputation !== null;
  }

  /**
   * Close a reputation account
   */
  async closeReputation(wallet: web3.PublicKey): Promise<string> {
    const [reputationPda] = this.getReputationPDA(wallet);

    const tx = await this.program.methods
      .closeReputation()
      .accounts({
        reputation: reputationPda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Helper methods for enum conversion
  private convertRiskLevel(level: RiskLevel): any {
    const map: Record<RiskLevel, any> = {
      [RiskLevel.HighlyTrusted]: { highlyTrusted: {} },
      [RiskLevel.Trusted]: { trusted: {} },
      [RiskLevel.MediumRisk]: { mediumRisk: {} },
      [RiskLevel.HighRisk]: { highRisk: {} },
    };
    return map[level];
  }

  private convertMetricType(type: MetricType): any {
    const map: Record<MetricType, any> = {
      [MetricType.None]: { none: {} },
      [MetricType.BehavioralStability]: { behavioralStability: {} },
      [MetricType.TransactionDiversity]: { transactionDiversity: {} },
      [MetricType.CounterpartyQuality]: { counterpartyQuality: {} },
      [MetricType.SmartContractHygiene]: { smartContractHygiene: {} },
      [MetricType.SybilResistance]: { sybilResistance: {} },
      [MetricType.RepaymentReliability]: { repaymentReliability: {} },
    };
    return map[type];
  }

  private convertRiskFlag(flag: RiskFlag): any {
    const map: Record<RiskFlag, any> = {
      [RiskFlag.None]: { none: {} },
      [RiskFlag.PotentialSybilCluster]: { potentialSybilCluster: {} },
      [RiskFlag.AbnormalTransactionBurst]: { abnormalTransactionBurst: {} },
      [RiskFlag.UnverifiedProgramInteraction]: { unverifiedProgramInteraction: {} },
      [RiskFlag.LowProtocolDiversity]: { lowProtocolDiversity: {} },
      [RiskFlag.ElevatedFailureRate]: { elevatedFailureRate: {} },
      [RiskFlag.NewWallet]: { newWallet: {} },
      [RiskFlag.WeakRepaymentHistory]: { weakRepaymentHistory: {} },
    };
    return map[flag];
  }

  private parseReputationAccount(account: any): ReputationData {
    return {
      wallet: account.wallet,
      authority: account.authority,
      trustScore: account.trustScore,
      riskLevel: this.parseRiskLevel(account.riskLevel),
      confidence: account.confidence,
      lastUpdated: account.lastUpdated.toNumber(),
      createdAt: account.createdAt.toNumber(),
      updateCount: account.updateCount.toNumber(),
      metrics: account.metrics.map((m: any) => this.parseMetric(m)),
      riskFlags: account.riskFlags.map((f: any) => this.parseRiskFlag(f)),
      activeFlagsCount: account.activeFlagsCount,
    };
  }

  private parseRiskLevel(level: any): RiskLevel {
    if (level.highlyTrusted) return RiskLevel.HighlyTrusted;
    if (level.trusted) return RiskLevel.Trusted;
    if (level.mediumRisk) return RiskLevel.MediumRisk;
    return RiskLevel.HighRisk;
  }

  private parseMetric(metric: any): Metric {
    return {
      metricType: this.parseMetricType(metric.metricType),
      value: metric.value,
    };
  }

  private parseMetricType(type: any): MetricType {
    if (type.behavioralStability) return MetricType.BehavioralStability;
    if (type.transactionDiversity) return MetricType.TransactionDiversity;
    if (type.counterpartyQuality) return MetricType.CounterpartyQuality;
    if (type.smartContractHygiene) return MetricType.SmartContractHygiene;
    if (type.sybilResistance) return MetricType.SybilResistance;
    if (type.repaymentReliability) return MetricType.RepaymentReliability;
    return MetricType.None;
  }

  private parseRiskFlag(flag: any): RiskFlag {
    if (flag.potentialSybilCluster) return RiskFlag.PotentialSybilCluster;
    if (flag.abnormalTransactionBurst) return RiskFlag.AbnormalTransactionBurst;
    if (flag.unverifiedProgramInteraction) return RiskFlag.UnverifiedProgramInteraction;
    if (flag.lowProtocolDiversity) return RiskFlag.LowProtocolDiversity;
    if (flag.elevatedFailureRate) return RiskFlag.ElevatedFailureRate;
    if (flag.newWallet) return RiskFlag.NewWallet;
    if (flag.weakRepaymentHistory) return RiskFlag.WeakRepaymentHistory;
    return RiskFlag.None;
  }
}

/**
 * Create a CredLayer client instance
 */
export function createCredLayerClient(provider: AnchorProvider): CredLayerClient {
  return new CredLayerClient(provider);
}
