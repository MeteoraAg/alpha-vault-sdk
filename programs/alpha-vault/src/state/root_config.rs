use crate::*;
use static_assertions::const_assert_eq;

#[account(zero_copy)]
#[derive(InitSpace, Debug)]
pub struct MerkleRootConfig {
    /// The 256-bit merkle root.
    pub root: [u8; 32],
    /// vault pubkey that config is belong
    pub vault: Pubkey,
    /// version
    pub version: u64,
    /// padding for further use
    pub _padding: [u128; 4],
}
const_assert_eq!(std::mem::size_of::<MerkleRootConfig>(), 136);
