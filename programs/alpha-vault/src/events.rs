use anchor_lang::prelude::*;

#[event]
pub struct ProrataVaultCreated {
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
    pub max_buying_cap: u64,
    pub pool: Pubkey,
    pub pool_type: u8,
    pub escrow_fee: u64,
    pub activation_type: u8,
}

#[event]
pub struct FcfsVaultCreated {
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
    pub max_depositing_cap: u64,
    pub pool: Pubkey,
    pub pool_type: u8,
    pub depositing_point: u64,
    pub individual_depositing_cap: u64,
    pub escrow_fee: u64,
    pub activation_type: u8,
}

#[event]
pub struct EscrowCreated {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub vault_total_escrow: u64,
    pub escrow_fee: u64,
}

#[event]
pub struct MerkleRootConfigCreated {
    pub admin: Pubkey,
    pub config: Pubkey,
    pub vault: Pubkey,
    pub version: u64,
    pub root: [u8; 32],
}

#[event]
pub struct ProrataVaultParametersUpdated {
    pub vault: Pubkey,
    pub max_buying_cap: u64,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
}

#[event]
pub struct FcfsVaultParametersUpdated {
    pub vault: Pubkey,
    pub max_depositing_cap: u64,
    pub start_vesting_point: u64,
    pub end_vesting_point: u64,
    pub depositing_point: u64,
    pub individual_depositing_cap: u64,
}

#[event]
pub struct EscrowRemainingWithdraw {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub vault_remaining_deposit: u64,
}

#[event]
pub struct EscrowWithdraw {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub vault_total_deposit: u64,
}

#[event]
pub struct SwapFill {
    pub vault: Pubkey,
    pub pair: Pubkey,
    pub fill_amount: u64,
    pub purchased_amount: u64,
    pub unfilled_amount: u64,
}

#[event]
pub struct EscrowDeposit {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub vault_total_deposit: u64,
}

#[event]
pub struct EscrowClosed {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub vault_total_escrow: u64,
}

#[event]
pub struct EscrowClaimToken {
    pub vault: Pubkey,
    pub escrow: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub vault_total_claimed_token: u64,
}

#[event]
pub struct CrankFeeWhitelistCreated {
    pub cranker: Pubkey,
}

#[event]
pub struct CrankFeeWhitelistClosed {
    pub cranker: Pubkey,
}
