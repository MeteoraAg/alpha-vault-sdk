use anchor_lang::prelude::*;

#[error_code]
#[derive(PartialEq)]
pub enum VaultError {
    #[msg("Time point is not in future")]
    TimePointNotInFuture,

    #[msg("Token mint is incorrect")]
    IncorrectTokenMint,

    #[msg("Pair is not permissioned")]
    IncorrectPairType,

    #[msg("Pool has started")]
    PoolHasStarted,

    #[msg("This action is not permitted in this time point")]
    NotPermitThisActionInThisTimePoint,

    #[msg("The sale is on going, cannot withdraw")]
    TheSaleIsOngoing,

    #[msg("Escrow is not closable")]
    EscrowIsNotClosable,

    #[msg("Time point orders are incorrect")]
    TimePointOrdersAreIncorrect,

    #[msg("Escrow has refunded")]
    EscrowHasRefuned,

    #[msg("Math operation overflow")]
    MathOverflow,

    #[msg("Max buying cap is zero")]
    MaxBuyingCapIsZero,

    #[msg("Max amount is too small")]
    MaxAmountIsTooSmall,

    #[msg("Pool type is not supported")]
    PoolTypeIsNotSupported,

    #[msg("Invalid admin")]
    InvalidAdmin,

    #[msg("Vault mode is incorrect")]
    VaultModeIsIncorrect,

    #[msg("Max depositing cap is invalid")]
    MaxDepositingCapIsInValid,

    #[msg("Vesting duration is invalid")]
    VestingDurationIsInValid,

    #[msg("Deposit amount is zero")]
    DepositAmountIsZero,

    #[msg("Pool owner is mismatched")]
    PoolOwnerIsMismatched,

    #[msg("Refund amount is zero")]
    RefundAmountIsZero,

    #[msg("Depositing duration is invalid")]
    DepositingDurationIsInvalid,

    #[msg("Depositing time point is invalid")]
    DepositingTimePointIsInvalid,

    #[msg("Individual depositing cap is zero")]
    IndividualDepositingCapIsZero,

    #[msg("Invalid fee receiver account")]
    InvalidFeeReceiverAccount,

    #[msg("Not permissioned vault")]
    NotPermissionedVault,

    #[msg("Not permit to do this action")]
    NotPermitToDoThisAction,

    #[msg("Invalid Merkle proof")]
    InvalidProof,

    #[msg("Invalid activation type")]
    InvalidActivationType,

    #[msg("Activation type is mismatched")]
    ActivationTypeIsMismatched,

    #[msg("Pool is not connected to the alpha vault")]
    InvalidPool,

    #[msg("Invalid creator")]
    InvalidCreator,

    #[msg("Permissioned vault cannot charge escrow fee")]
    PermissionedVaultCannotChargeEscrowFee,

    #[msg("Escrow fee too high")]
    EscrowFeeTooHigh,

    #[msg("Lock duration is invalid")]
    LockDurationInvalid,

    #[msg("Max buying cap is too small")]
    MaxBuyingCapIsTooSmall,

    #[msg("Max depositing cap is too small")]
    MaxDepositingCapIsTooSmall,

    #[msg("Invalid whitelist wallet mode")]
    InvalidWhitelistWalletMode,

    #[msg("Invalid crank fee whitelist")]
    InvalidCrankFeeWhitelist,

    #[msg("Missing fee receiver")]
    MissingFeeReceiver,
}
