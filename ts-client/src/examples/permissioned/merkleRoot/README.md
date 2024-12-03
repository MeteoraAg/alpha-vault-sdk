# Permissioned vault with merkle root example

This example demonstrates how to use the permissioned vault to achieve authorization of deposit with whitelisted wallet and deposit cap.

Steps:

1. Update address and deposit cap. Check `whitelist_wallet.csv`.
2. Create a pool with permissioned vault. Check `createDynamicPoolWithPermissionedVault.ts` or `createCustomizableDynamicPoolWithPermissionedVault.ts` or `createCustomizableDlmmWithPermissionlessVault.ts` for more details.
3. Generate merkle tree, and create merkle root config. Check `createMerkleRootConfig.ts` for more details.
4. Deposit with merkle proof. Check `depositWithProof.ts` for more details.
5. The rest of the methods will be the same as permissionless vault.
