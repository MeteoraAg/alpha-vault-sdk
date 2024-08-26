use anchor_lang::prelude::*;

pub fn derive_vault_pda(base: Pubkey, pair: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"vault", base.as_ref(), pair.as_ref()], &crate::ID)
}
pub fn derive_escrow_pda(vault: Pubkey, owner: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"escrow", vault.as_ref(), owner.as_ref()], &crate::ID)
}

pub fn derive_event_authority_pda() -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"__event_authority"], &crate::ID)
}

pub fn derive_fcfs_config_pda(index: u64) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"fcfs_config", index.to_le_bytes().as_ref()], &crate::ID)
}

pub fn derive_prorata_config_pda(index: u64) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"prorata_config", index.to_le_bytes().as_ref()],
        &crate::ID,
    )
}
