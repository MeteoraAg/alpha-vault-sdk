use crate::*;

#[account(zero_copy)]
#[derive(InitSpace)]
pub struct CrankFeeWhitelist {
    pub owner: Pubkey,
    pub padding: [u128; 5],
}
