use crate::*;
use static_assertions::const_assert_eq;

#[account(zero_copy)]
#[derive(InitSpace)]
pub struct Escrow {
    /// vault address
    pub vault: Pubkey,
    /// owner
    pub owner: Pubkey,
    /// total deposited quote token
    pub total_deposit: u64,
    /// Total token that escrow has claimed
    pub claimed_token: u64,
    /// Last claimed timestamp
    pub last_claimed_point: u64,
    /// Whether owner has claimed for remaining quote token
    pub refunded: u8,
    /// padding 1
    pub padding_1: [u8; 7],
    /// Only has meaning in permissioned vault
    pub max_cap: u64,
    /// padding 2
    pub padding_2: [u8; 8],
    // pub padding_0:
    pub padding: [u128; 1],
}

const_assert_eq!(std::mem::size_of::<Escrow>(), 128);
