use crate::*;
use num_enum::{IntoPrimitive, TryFromPrimitive};
use static_assertions::const_assert_eq;

#[derive(Copy, Clone, Debug, PartialEq, Eq, IntoPrimitive, TryFromPrimitive)]
#[repr(u8)]
/// Type of the Pair. 0 = Permissionless, 1 = Permission. Putting 0 as permissionless for backward compatibility.
pub enum PoolType {
    Dlmm,
    DynamicPool,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, IntoPrimitive, TryFromPrimitive)]
#[repr(u8)]
/// Vault Mode. 0 = Prorata, 1 = FirstComeFirstServe. Putting 0 as Prorata for backward compatibility.
pub enum VaultMode {
    // In Prorata mode, user is able to deposit over the max_buying_cap
    // User is able to withdraw before last_join_point
    // Vault will only buy up to max_buying_cap, user can withdraw remaining quote after vault bought from pool
    Prorata,
    // In Fcfs mode, if total deposit is equal to deposit_cap, then user can't deposit anymore
    // User will not be able withdraw, once deposit
    // Vault will buy with all it has in reserve
    Fcfs,
}

#[account(zero_copy)]
#[derive(InitSpace, Debug)]
pub struct Vault {
    ///  pool
    pub pool: Pubkey,
    /// reserve quote token
    pub token_vault: Pubkey,
    /// reserve base token
    pub token_out_vault: Pubkey,
    /// quote token
    pub quote_mint: Pubkey,
    /// base token
    pub base_mint: Pubkey,
    /// base key
    pub base: Pubkey,
    /// owner key, deprecated field, can re-use in the future
    #[deprecated]
    pub owner: Pubkey,
    /// max buying cap
    pub max_buying_cap: u64, // only need to care for this field in Prorata mode
    /// total deposited quote token
    pub total_deposit: u64,
    /// total user deposit
    pub total_escrow: u64,
    /// swapped_amount
    pub swapped_amount: u64,
    /// total bought token
    pub bought_token: u64,
    /// Total quote refund
    pub total_refund: u64,
    /// Total claimed_token
    pub total_claimed_token: u64,
    /// Start vesting ts
    pub start_vesting_point: u64,
    /// End vesting ts
    pub end_vesting_point: u64,
    /// bump
    pub bump: u8,
    /// pool type
    pub pool_type: u8,
    /// vault mode
    pub vault_mode: u8,
    /// padding 0
    pub padding_0: [u8; 5],
    /// max depositing cap
    pub max_depositing_cap: u64, // only need to care for this field in FirstComeFirstServe mode
    /// individual depositing cap
    pub individual_depositing_cap: u64,
    /// depositing point
    pub depositing_point: u64,
    /// flat fee when user open an escrow
    pub escrow_fee: u64,
    /// total escrow fee just for statistic
    pub total_escrow_fee: u64,
    /// permissioned flag
    pub permissioned: u8,
    /// activation type
    pub activation_type: u8,
    /// padding 1
    pub padding_1: [u8; 6],
    // pub padding_0:
    pub padding: [u128; 7],
}

const_assert_eq!(std::mem::size_of::<Vault>(), 464);
