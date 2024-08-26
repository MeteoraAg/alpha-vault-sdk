use crate::*;
use anchor_spl::token_interface::TokenAccount;
#[event_cpi]
#[derive(Accounts)]
pub struct FillDynamicAmmCtx<'info> {
    #[account(mut, has_one=token_vault, has_one = token_out_vault, has_one=pool)]
    pub vault: AccountLoader<'info, Vault>,

    #[account(mut)]
    pub token_vault: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub token_out_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK:
    pub amm_program: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub a_vault: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub b_vault: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub a_token_vault: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub b_token_vault: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub a_vault_lp_mint: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub b_vault_lp_mint: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub a_vault_lp: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub b_vault_lp: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub admin_token_fee: UncheckedAccount<'info>,

    /// CHECK:
    pub vault_program: UncheckedAccount<'info>,

    /// CHECK:
    pub token_program: UncheckedAccount<'info>,
}

pub fn handle_fill_dynamic_amm<'info>(
    _ctx: Context<'_, '_, '_, 'info, FillDynamicAmmCtx<'info>>,
    _max_amount: u64,
) -> Result<()> {
    Ok(())
}
