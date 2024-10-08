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
