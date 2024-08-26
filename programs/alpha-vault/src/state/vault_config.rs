use crate::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct ProrataVaultConfig {
    pub max_buying_cap: u64,
    pub start_vesting_duration: u64,
    pub end_vesting_duration: u64,
    pub escrow_fee: u64,
    pub activation_type: u8,
    pub _padding: [u8; 191],
}

#[account]
#[derive(InitSpace, Debug)]
pub struct FcfsVaultConfig {
    pub max_depositing_cap: u64,
    pub start_vesting_duration: u64,
    pub end_vesting_duration: u64,
    pub depositing_duration_until_last_join_point: u64,
    pub individual_depositing_cap: u64,
    pub escrow_fee: u64,
    pub activation_type: u8,
    pub _padding: [u8; 175],
}
