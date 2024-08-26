use crate::*;
use anchor_spl::token_interface::TokenAccount;

#[event_cpi]
#[derive(Accounts)]
pub struct FillDlmmCtx<'info> {
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
    pub bin_array_bitmap_extension: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub reserve_x: UncheckedAccount<'info>,
    /// CHECK:
    #[account(mut)]
    pub reserve_y: UncheckedAccount<'info>,
    /// CHECK:
    pub token_x_mint: UncheckedAccount<'info>,
    /// CHECK:
    pub token_y_mint: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub oracle: UncheckedAccount<'info>,
    /// CHECK:
    pub token_x_program: UncheckedAccount<'info>,
    /// CHECK:
    pub token_y_program: UncheckedAccount<'info>,
    /// CHECK:
    pub dlmm_event_authority: UncheckedAccount<'info>,
}

pub fn handle_fill_dlmm<'info>(
    _ctx: Context<'_, '_, '_, 'info, FillDlmmCtx<'info>>,
    _max_amount: u64,
) -> Result<()> {
    Ok(())
}
