# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## @meteora-ag/alpha-vault [1.1.14] [PR #16](https://github.com/MeteoraAg/alpha-vault-sdk/pull/16)

### Added

- `createMerkleProofMetadata` function. Allow vault creator to submit merkle proof API endpoint.
- `closeMerkleProofMetadata` function. Allow vault creator to close merkle proof metadata account.
- `getMerkleProofUrl` function. Get merkle proof API endpoint from merkle proof metadata account. If not available, it default back to meteora API endpoint
- `deriveMerkleProofMetadata` function. Derive merkle proof metadata account PDA.
- `getMerkleProofForDeposit` function. Get merkle proof required for deposit based on merkle proof API stored in `MerkleProofMetadata`.

### Changed

- `withdrawRemainingQuote` can only be invoked after vault fill stage, which the condition is `current_point > last_buying_point`.
- `withdraw` have 2 stages now. The first stage is to withdraw from escrow and the second stage is to withdraw excessive quote token from the vault. The second stage (new stage) is only applicable when the vault is in prorata mode. The second stage is triggered when the `current_point >= last_join_point && current_point <= last_buying_point`. The second stage is being represented as `canWithdrawDepositOverflow` in `InteractionState` object, and the amount can be withdrawn in that stage is `availableDepositOverflow` in `InteractionState` object.

## @meteora-ag/alpha-vault [1.1.11] [PR #13](https://github.com/MeteoraAg/alpha-vault-sdk/pull/13)

### Added

- Support on DAMM v2
- Support DLMM token 2022

## alpha-vault [0.4.0] [PR #13](https://github.com/MeteoraAg/alpha-vault-sdk/pull/13)

### Changed

- Use `declare_program!` macro for program interface

## alpha-vault [0.3.3] [PR #11](https://github.com/MeteoraAg/alpha-vault-sdk/pull/11)

### Added

- `create_crank_fee_whitelist` endpoint. Used to create crank fee whitelist account for cranker. Cranker with crank fee whitelist PDA do not need to pay for crank fee if they pass in the account when `fill_dlmm` or `fill_amm`
- `close_crank_fee_whitelist` endpoint. Used to close crank fee whitelist account.

### Changed

- `fill_dlmm` endpoint require `cranker`, `crank_fee_whitelist` and `crank_fee_receiver` parameter.
- `fill_dynamic_amm` endpoint require `cranker`, `crank_fee_whitelist` and `crank_fee_receiver` parameter.

## @meteora-ag/alpha-vault [1.1.10] [PR #11](https://github.com/MeteoraAg/alpha-vault-sdk/pull/11)

### Changed

- `fillVault` will pass in `crank_fee_whitelist` account to bypass crank fee if cranker is whitelisted.

## @meteora-ag/alpha-vault [1.1.9] [PR #9](https://github.com/MeteoraAg/alpha-vault-sdk/pull/9)

### Fixed

- Fix bug `getDepositInfo` method

## @meteora-ag/alpha-vault [1.1.8] [PR #8](https://github.com/MeteoraAg/alpha-vault-sdk/pull/8)

### Fixed

- Add localhost value to cluster

## @meteora-ag/alpha-vault [1.1.7] [PR #7](https://github.com/MeteoraAg/alpha-vault-sdk/pull/7)

### Fixed

- Fix `@solana/web3.js` version to `^1.95.4`

### Added

- Added localhost AlphaVault Program ID

## @meteora-ag/alpha-vault [1.1.6] [PR #6](https://github.com/MeteoraAg/alpha-vault-sdk/pull/6)

### Fixed

- Fix `createStakeEscrowByAuthority` missing parameter `vaultAuthority`

### Added

- Added function `createMultipleStakeEscrowByAuthorityInstructions` to allow vault creator to create multiple stake escrow accounts in single transaction.
- Added function `createCustomizableFcfsVault` to create FCFS vault with customizable parameters
- Added function `createCustomizableProrataVault` to create prorata vault with customizable parameters

## @meteora-ag/alpha-vault [1.1.5] [PR #5](https://github.com/MeteoraAg/alpha-vault-sdk/pull/5)

### Added

- Added function `createStakeEscrowByAuthority` which allow vault creator to create stake escrow on user behalf. Vault whitelist mode must be `PermissionWithAuthority`

### Changed

- Renamed function `createPermissionedVault` to `createPermissionedVaultWithMerkleProof`
- Added function `createPermissionedVaultWithAuthorityFund` which allow user to create alpha vault with whitelist wallet feature without merkle proof. Only the vault creator can create the stake escrow account.

## alpha-vault [0.3.2] [PR #5](https://github.com/MeteoraAg/alpha-vault-sdk/pull/5)

### Added

- Create escrow now supports 3 modes: `Permissionless`, `PermissionWithMerkleProof` and `PermissionWithAuthority`

- In the new mode `PermissionWithAuthority`, only `vault.vault_authority` is able to create new escrow, that allows alpha-vault creator is able to seed escrow accounts easily without merkle tree

- Add the new endpoint `create_permissioned_escrow_with_authority`

### Changed

- Vault account field `permissioned` renamed to `whitelist_mode`
- `initialize_fcfs_vault`, `initialize_prorata_vault` endpoint `permissioned` field updated to `whitelist_mode`

## @meteora-ag/alpha-vault [1.1.4] [PR #4](https://github.com/MeteoraAg/alpha-vault-sdk/pull/4)

### Changed

- Export `merkle_tree`, `helper` & `constants`

## @meteora-ag/alpha-vault [1.1.3] [PR #3](https://github.com/MeteoraAg/alpha-vault-sdk/pull/3)

### Changed

- Export type `ActivationType`

## alpha-vault-sdk [0.1.2] - PR [#2](https://github.com/MeteoraAg/alpha-vault-sdk/pull/2)

### Fixed

- Fix bug in `fillVault` method

## alpha-vault [0.1.0] - PR [#1](https://github.com/MeteoraAg/alpha-vault-sdk/pull/1)

### Added

- Program interface

## @meteora-ag/alpha-vault [1.1.1] - PR [#1](https://github.com/MeteoraAg/alpha-vault-sdk/pull/1)

### Added

- Added examples on how to use Alpha Vault SDK. Check `ts-client/src/examples`
- Add `fillVault` method to crank the vault to purchase tokens from the pool.
- Add `closeEscrow` method to close the escrow account.

### Changed

- `deposit` require to pass `DepositWithProofParams` if the vault is permissioned.
