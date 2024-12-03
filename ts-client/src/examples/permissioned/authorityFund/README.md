# Permissioned vault with authhority fund example

This example demonstrates how to use the permissioned vault to achieve authorization of deposit with whitelisted wallet and deposit cap.

Steps:

1. Create a pool with permissioned vault. Check `createDynamicPoolWithPermissionedVault.ts` or `createCustomizableDynamicPoolWithPermissionedVault.ts` or `createCustomizableDlmmWithPermissionlessVault.ts` for more details.
2. Create `StakeEscrow` account for each whitelisted wallet. Check `createStakeEscrowByAuthority.ts` for more details.
3. The rest of the methods will be the same as permissionless vault.
