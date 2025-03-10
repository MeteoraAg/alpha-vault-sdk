#[cfg(not(feature = "localnet"))]
pub const SLOT_BUFFER: u64 = 3000; // 20 minutes

#[cfg(feature = "localnet")]
pub const SLOT_BUFFER: u64 = 0;

#[cfg(not(feature = "localnet"))]
pub const TIME_BUFFER: u64 = 1200; // 20 minutes

#[cfg(feature = "localnet")]
pub const TIME_BUFFER: u64 = 0;

// 0.0001 SOL
pub const CRANK_FEE: u64 = 100_000;
