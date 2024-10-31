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
