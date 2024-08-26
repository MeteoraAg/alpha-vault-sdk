export type AlphaVault = {
  version: "0.1.0";
  name: "alpha_vault";
  instructions: [
    {
      name: "initializeProrataVault";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "funder";
          isMut: true;
          isSigner: true;
        },
        {
          name: "base";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitializeProrataVaultParams";
          };
        }
      ];
    },
    {
      name: "initializeVaultWithProrataConfig";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "funder";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitializeVaultWithConfigParams";
          };
        }
      ];
    },
    {
      name: "updateProrataVaultParameters";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "UpdateProrataVaultParams";
          };
        }
      ];
    },
    {
      name: "createProrataConfig";
      accounts: [
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "configParameters";
          type: {
            defined: "ProrataConfigParameters";
          };
        }
      ];
    },
    {
      name: "closeProrataConfig";
      accounts: [
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rentReceiver";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "initializeFcfsVault";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "funder";
          isMut: true;
          isSigner: true;
        },
        {
          name: "base";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitializeFcfsVaultParams";
          };
        }
      ];
    },
    {
      name: "initializeVaultWithFcfsConfig";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "quoteMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "funder";
          isMut: true;
          isSigner: true;
        },
        {
          name: "config";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "InitializeVaultWithConfigParams";
          };
        }
      ];
    },
    {
      name: "updateFcfsVaultParameters";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "UpdateFcfsVaultParams";
          };
        }
      ];
    },
    {
      name: "createFcfsConfig";
      accounts: [
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "configParameters";
          type: {
            defined: "FcfsConfigParameters";
          };
        }
      ];
    },
    {
      name: "closeFcfsConfig";
      accounts: [
        {
          name: "config";
          isMut: true;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rentReceiver";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createMerkleRootConfig";
      accounts: [
        {
          name: "vault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merkleRootConfig";
          isMut: true;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "CreateMerkleRootConfigParams";
          };
        }
      ];
    },
    {
      name: "createNewEscrow";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "escrowFeeReceiver";
          isMut: true;
          isSigner: false;
          isOptional: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createPermissionedEscrow";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merkleRootConfig";
          isMut: false;
          isSigner: false;
          docs: ["merkle_root_config"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "escrowFeeReceiver";
          isMut: true;
          isSigner: false;
          isOptional: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "maxCap";
          type: "u64";
        },
        {
          name: "proof";
          type: {
            vec: {
              array: ["u8", 32];
            };
          };
        }
      ];
    },
    {
      name: "closeEscrow";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rentReceiver";
          isMut: true;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "deposit";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "sourceToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "maxAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdraw";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destinationToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdrawRemainingQuote";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destinationToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimToken";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenOutVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destinationToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "fillDlmm";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenOutVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ammProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "binArrayBitmapExtension";
          isMut: false;
          isSigner: false;
        },
        {
          name: "reserveX";
          isMut: true;
          isSigner: false;
        },
        {
          name: "reserveY";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenXMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenYMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "oracle";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenXProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenYProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "dlmmEventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "maxAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "fillDynamicAmm";
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenOutVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ammProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "pool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aTokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bTokenVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aVaultLpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bVaultLpMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "aVaultLp";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bVaultLp";
          isMut: true;
          isSigner: false;
        },
        {
          name: "adminTokenFee";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "maxAmount";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "escrow";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vault";
            docs: ["vault address"];
            type: "publicKey";
          },
          {
            name: "owner";
            docs: ["owner"];
            type: "publicKey";
          },
          {
            name: "totalDeposit";
            docs: ["total deposited quote token"];
            type: "u64";
          },
          {
            name: "claimedToken";
            docs: ["Total token that escrow has claimed"];
            type: "u64";
          },
          {
            name: "lastClaimedSlot";
            docs: ["Last claimed timestamp"];
            type: "u64";
          },
          {
            name: "refunded";
            docs: ["Whether owner has claimed for remaining quote token"];
            type: "u8";
          },
          {
            name: "padding1";
            docs: ["padding 1"];
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "maxCap";
            docs: ["Only has meaning in permissioned vault"];
            type: "u64";
          },
          {
            name: "padding2";
            docs: ["padding 2"];
            type: {
              array: ["u8", 8];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u128", 1];
            };
          }
        ];
      };
    },
    {
      name: "merkleRootConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "root";
            docs: ["The 256-bit merkle root."];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "vault";
            docs: ["vault pubkey that config is belong"];
            type: "publicKey";
          },
          {
            name: "version";
            docs: ["version"];
            type: "u64";
          },
          {
            name: "padding";
            docs: ["padding for further use"];
            type: {
              array: ["u128", 4];
            };
          }
        ];
      };
    },
    {
      name: "prorataVaultConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxBuyingCap";
            type: "u64";
          },
          {
            name: "startVestingDuration";
            type: "u64";
          },
          {
            name: "endVestingDuration";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 192];
            };
          }
        ];
      };
    },
    {
      name: "fcfsVaultConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxDepositingCap";
            type: "u64";
          },
          {
            name: "startVestingDuration";
            type: "u64";
          },
          {
            name: "endVestingDuration";
            type: "u64";
          },
          {
            name: "depositingSlotDurationUntilLastJoinSlot";
            type: "u64";
          },
          {
            name: "individualDepositingCap";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "padding";
            type: {
              array: ["u8", 176];
            };
          }
        ];
      };
    },
    {
      name: "vault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pool";
            docs: ["pool"];
            type: "publicKey";
          },
          {
            name: "tokenVault";
            docs: ["reserve quote token"];
            type: "publicKey";
          },
          {
            name: "tokenOutVault";
            docs: ["reserve base token"];
            type: "publicKey";
          },
          {
            name: "quoteMint";
            docs: ["quote token"];
            type: "publicKey";
          },
          {
            name: "baseMint";
            docs: ["base token"];
            type: "publicKey";
          },
          {
            name: "base";
            docs: ["base key"];
            type: "publicKey";
          },
          {
            name: "owner";
            docs: ["owner key, deprecated field, can re-use in the future"];
            type: "publicKey";
          },
          {
            name: "maxBuyingCap";
            docs: ["max buying cap"];
            type: "u64";
          },
          {
            name: "totalDeposit";
            docs: ["total deposited quote token"];
            type: "u64";
          },
          {
            name: "totalEscrow";
            docs: ["total user deposit"];
            type: "u64";
          },
          {
            name: "swappedAmount";
            docs: ["swapped_amount"];
            type: "u64";
          },
          {
            name: "boughtToken";
            docs: ["total bought token"];
            type: "u64";
          },
          {
            name: "totalRefund";
            docs: ["Total quote refund"];
            type: "u64";
          },
          {
            name: "totalClaimedToken";
            docs: ["Total claimed_token"];
            type: "u64";
          },
          {
            name: "startVestingSlot";
            docs: ["Start vesting ts"];
            type: "u64";
          },
          {
            name: "endVestingSlot";
            docs: ["End vesting ts"];
            type: "u64";
          },
          {
            name: "bump";
            docs: ["bump"];
            type: "u8";
          },
          {
            name: "poolType";
            docs: ["pool type"];
            type: "u8";
          },
          {
            name: "vaultMode";
            docs: ["vault mode"];
            type: "u8";
          },
          {
            name: "padding0";
            docs: ["padding 0"];
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "maxDepositingCap";
            docs: ["max depositing cap"];
            type: "u64";
          },
          {
            name: "individualDepositingCap";
            docs: ["individual depositing cap"];
            type: "u64";
          },
          {
            name: "depositingSlot";
            docs: ["depositing slot"];
            type: "u64";
          },
          {
            name: "escrowFee";
            docs: ["flat fee when user open an escrow"];
            type: "u64";
          },
          {
            name: "totalEscrowFee";
            docs: ["total escrow fee just for statistic"];
            type: "u64";
          },
          {
            name: "permissioned";
            docs: ["permissioned flag"];
            type: "u8";
          },
          {
            name: "padding1";
            docs: ["padding 1"];
            type: {
              array: ["u8", 7];
            };
          },
          {
            name: "padding";
            type: {
              array: ["u128", 7];
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "CreateMerkleRootConfigParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "root";
            docs: ["The 256-bit merkle root."];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "version";
            docs: ["version"];
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FcfsConfigParameters";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxDepositingCap";
            type: "u64";
          },
          {
            name: "startVestingDuration";
            type: "u64";
          },
          {
            name: "endVestingDuration";
            type: "u64";
          },
          {
            name: "depositingSlotDurationUntilLastJoinSlot";
            type: "u64";
          },
          {
            name: "individualDepositingCap";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "index";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InitializeFcfsVaultParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolType";
            type: "u8";
          },
          {
            name: "quoteMint";
            type: "publicKey";
          },
          {
            name: "baseMint";
            type: "publicKey";
          },
          {
            name: "depositingSlot";
            type: "u64";
          },
          {
            name: "startVestingSlot";
            type: "u64";
          },
          {
            name: "endVestingSlot";
            type: "u64";
          },
          {
            name: "maxDepositingCap";
            type: "u64";
          },
          {
            name: "individualDepositingCap";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "permissioned";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "UpdateFcfsVaultParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxDepositingCap";
            type: "u64";
          },
          {
            name: "depositingSlot";
            type: "u64";
          },
          {
            name: "individualDepositingCap";
            type: "u64";
          },
          {
            name: "startVestingSlot";
            type: "u64";
          },
          {
            name: "endVestingSlot";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "ProrataConfigParameters";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxBuyingCap";
            type: "u64";
          },
          {
            name: "startVestingDuration";
            type: "u64";
          },
          {
            name: "endVestingDuration";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "index";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "InitializeProrataVaultParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolType";
            type: "u8";
          },
          {
            name: "quoteMint";
            type: "publicKey";
          },
          {
            name: "baseMint";
            type: "publicKey";
          },
          {
            name: "depositingSlot";
            type: "u64";
          },
          {
            name: "startVestingSlot";
            type: "u64";
          },
          {
            name: "endVestingSlot";
            type: "u64";
          },
          {
            name: "maxBuyingCap";
            type: "u64";
          },
          {
            name: "escrowFee";
            type: "u64";
          },
          {
            name: "permissioned";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "InitializeVaultWithConfigParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolType";
            type: "u8";
          },
          {
            name: "quoteMint";
            type: "publicKey";
          },
          {
            name: "baseMint";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "UpdateProrataVaultParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "maxBuyingCap";
            type: "u64";
          },
          {
            name: "startVestingSlot";
            type: "u64";
          },
          {
            name: "endVestingSlot";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "PoolType";
      docs: [
        "Type of the Pair. 0 = Permissionless, 1 = Permission. Putting 0 as permissionless for backward compatibility."
      ];
      type: {
        kind: "enum";
        variants: [
          {
            name: "Dlmm";
          },
          {
            name: "DynamicPool";
          }
        ];
      };
    },
    {
      name: "VaultMode";
      docs: [
        "Vault Mode. 0 = Prorata, 1 = FirstComeFirstServe. Putting 0 as Prorata for backward compatibility."
      ];
      type: {
        kind: "enum";
        variants: [
          {
            name: "Prorata";
          },
          {
            name: "Fcfs";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "ProrataVaultCreated";
      fields: [
        {
          name: "baseMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "quoteMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "startVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "endVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "maxBuyingCap";
          type: "u64";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "poolType";
          type: "u8";
          index: false;
        },
        {
          name: "escrowFee";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "FcfsVaultCreated";
      fields: [
        {
          name: "baseMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "quoteMint";
          type: "publicKey";
          index: false;
        },
        {
          name: "startVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "endVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "maxDepositingCap";
          type: "u64";
          index: false;
        },
        {
          name: "pool";
          type: "publicKey";
          index: false;
        },
        {
          name: "poolType";
          type: "u8";
          index: false;
        },
        {
          name: "depositingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "individualDepositingCap";
          type: "u64";
          index: false;
        },
        {
          name: "escrowFee";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowCreated";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "vaultTotalEscrow";
          type: "u64";
          index: false;
        },
        {
          name: "escrowFee";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "MerkleRootConfigCreated";
      fields: [
        {
          name: "admin";
          type: "publicKey";
          index: false;
        },
        {
          name: "config";
          type: "publicKey";
          index: false;
        },
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "verstion";
          type: "u64";
          index: false;
        },
        {
          name: "root";
          type: {
            array: ["u8", 32];
          };
          index: false;
        }
      ];
    },
    {
      name: "ProrataVaultParametersUpdated";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "maxBuyingCap";
          type: "u64";
          index: false;
        },
        {
          name: "startVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "endVestingSlot";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "FcfsVaultParametersUpdated";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "maxDepositingCap";
          type: "u64";
          index: false;
        },
        {
          name: "startVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "endVestingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "depositingSlot";
          type: "u64";
          index: false;
        },
        {
          name: "individualDepositingCap";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowRemainingWithdraw";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "vaultRemainingDeposit";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowWithdraw";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "vaultTotalDeposit";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "SwapFill";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "pair";
          type: "publicKey";
          index: false;
        },
        {
          name: "fillAmount";
          type: "u64";
          index: false;
        },
        {
          name: "purchasedAmount";
          type: "u64";
          index: false;
        },
        {
          name: "unfilledAmount";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowDeposit";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "vaultTotalDeposit";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowClosed";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "vaultTotalEscrow";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "EscrowClaimToken";
      fields: [
        {
          name: "vault";
          type: "publicKey";
          index: false;
        },
        {
          name: "escrow";
          type: "publicKey";
          index: false;
        },
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        },
        {
          name: "vaultTotalClaimedToken";
          type: "u64";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "StartSlotAfterEnd";
      msg: "start slot is after end slot";
    },
    {
      code: 6001;
      name: "SlotNotInFuture";
      msg: "slot is not in future";
    },
    {
      code: 6002;
      name: "IncorrectTokenMint";
      msg: "token mint is incorrect";
    },
    {
      code: 6003;
      name: "IncorrectPairType";
      msg: "pair is not permissioned";
    },
    {
      code: 6004;
      name: "PoolHasStarted";
      msg: "Pool has started";
    },
    {
      code: 6005;
      name: "NotPermitThisActionInThisSlot";
      msg: "This action is not permitted in this slot";
    },
    {
      code: 6006;
      name: "TheSaleIsOngoing";
      msg: "the sale is on going, cannot withdraw";
    },
    {
      code: 6007;
      name: "EscrowIsNotClosable";
      msg: "Escrow is not closable";
    },
    {
      code: 6008;
      name: "SlotOrdersAreIncorrect";
      msg: "Slot orders are incorrect";
    },
    {
      code: 6009;
      name: "EscrowHasRefuned";
      msg: "Escrow has refunded";
    },
    {
      code: 6010;
      name: "MathOverflow";
      msg: "Math operation overflow";
    },
    {
      code: 6011;
      name: "MaxBuyingCapIsZero";
      msg: "Max buying cap is zero";
    },
    {
      code: 6012;
      name: "MaxAmountIsTooSmall";
      msg: "Max amount is too small";
    },
    {
      code: 6013;
      name: "PoolTypeIsNotSupported";
      msg: "Pool type is not supported";
    },
    {
      code: 6014;
      name: "InvalidAdmin";
      msg: "Invalid admin";
    },
    {
      code: 6015;
      name: "VaultModeIsIncorrect";
      msg: "Vault mode is incorrect";
    },
    {
      code: 6016;
      name: "MaxDepositingCapIsInValid";
      msg: "Max depositing cap is invalid";
    },
    {
      code: 6017;
      name: "VestingDurationIsInValid";
      msg: "Vesting duration is invalid";
    },
    {
      code: 6018;
      name: "DepositAmountIsZero";
      msg: "Deposit amount is zero";
    },
    {
      code: 6019;
      name: "PoolOwnerIsMismatched";
      msg: "Pool owner is mismatched";
    },
    {
      code: 6020;
      name: "RefundAmountIsZero";
      msg: "Refund amount is zero";
    },
    {
      code: 6021;
      name: "DepositingSlotDurationIsInvalid";
      msg: "Depositing slot duration is invalid";
    },
    {
      code: 6022;
      name: "DepositingSlotIsInvalid";
      msg: "Depositing slot is invalid";
    },
    {
      code: 6023;
      name: "IndividualDepositingCapIsZero";
      msg: "Individual depositing cap is zero";
    },
    {
      code: 6024;
      name: "InvalidFeeReceiverAccount";
      msg: "Invalid fee receiver account";
    },
    {
      code: 6025;
      name: "NotPermissionedVault";
      msg: "Not permissioned vault";
    },
    {
      code: 6026;
      name: "NotPermitToDoThisAction";
      msg: "Not permit to do this action";
    },
    {
      code: 6027;
      name: "InvalidProof";
      msg: "Invalid Merkle proof.";
    }
  ];
};

export const IDL: AlphaVault = {
  version: "0.1.0",
  name: "alpha_vault",
  instructions: [
    {
      name: "initializeProrataVault",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "base",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitializeProrataVaultParams",
          },
        },
      ],
    },
    {
      name: "initializeVaultWithProrataConfig",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitializeVaultWithConfigParams",
          },
        },
      ],
    },
    {
      name: "updateProrataVaultParameters",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "UpdateProrataVaultParams",
          },
        },
      ],
    },
    {
      name: "createProrataConfig",
      accounts: [
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "configParameters",
          type: {
            defined: "ProrataConfigParameters",
          },
        },
      ],
    },
    {
      name: "closeProrataConfig",
      accounts: [
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rentReceiver",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "initializeFcfsVault",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "base",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitializeFcfsVaultParams",
          },
        },
      ],
    },
    {
      name: "initializeVaultWithFcfsConfig",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "quoteMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "funder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "config",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitializeVaultWithConfigParams",
          },
        },
      ],
    },
    {
      name: "updateFcfsVaultParameters",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "UpdateFcfsVaultParams",
          },
        },
      ],
    },
    {
      name: "createFcfsConfig",
      accounts: [
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "configParameters",
          type: {
            defined: "FcfsConfigParameters",
          },
        },
      ],
    },
    {
      name: "closeFcfsConfig",
      accounts: [
        {
          name: "config",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rentReceiver",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createMerkleRootConfig",
      accounts: [
        {
          name: "vault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merkleRootConfig",
          isMut: true,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "CreateMerkleRootConfigParams",
          },
        },
      ],
    },
    {
      name: "createNewEscrow",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrowFeeReceiver",
          isMut: true,
          isSigner: false,
          isOptional: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createPermissionedEscrow",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merkleRootConfig",
          isMut: false,
          isSigner: false,
          docs: ["merkle_root_config"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrowFeeReceiver",
          isMut: true,
          isSigner: false,
          isOptional: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxCap",
          type: "u64",
        },
        {
          name: "proof",
          type: {
            vec: {
              array: ["u8", 32],
            },
          },
        },
      ],
    },
    {
      name: "closeEscrow",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rentReceiver",
          isMut: true,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "deposit",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "sourceToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destinationToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawRemainingQuote",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destinationToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claimToken",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenOutVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destinationToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "fillDlmm",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenOutVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ammProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "binArrayBitmapExtension",
          isMut: false,
          isSigner: false,
        },
        {
          name: "reserveX",
          isMut: true,
          isSigner: false,
        },
        {
          name: "reserveY",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenXMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenYMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "oracle",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenXProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenYProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "dlmmEventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "fillDynamicAmm",
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenOutVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ammProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "pool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aTokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bTokenVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aVaultLpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bVaultLpMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "aVaultLp",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bVaultLp",
          isMut: true,
          isSigner: false,
        },
        {
          name: "adminTokenFee",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxAmount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "escrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vault",
            docs: ["vault address"],
            type: "publicKey",
          },
          {
            name: "owner",
            docs: ["owner"],
            type: "publicKey",
          },
          {
            name: "totalDeposit",
            docs: ["total deposited quote token"],
            type: "u64",
          },
          {
            name: "claimedToken",
            docs: ["Total token that escrow has claimed"],
            type: "u64",
          },
          {
            name: "lastClaimedSlot",
            docs: ["Last claimed timestamp"],
            type: "u64",
          },
          {
            name: "refunded",
            docs: ["Whether owner has claimed for remaining quote token"],
            type: "u8",
          },
          {
            name: "padding1",
            docs: ["padding 1"],
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "maxCap",
            docs: ["Only has meaning in permissioned vault"],
            type: "u64",
          },
          {
            name: "padding2",
            docs: ["padding 2"],
            type: {
              array: ["u8", 8],
            },
          },
          {
            name: "padding",
            type: {
              array: ["u128", 1],
            },
          },
        ],
      },
    },
    {
      name: "merkleRootConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "root",
            docs: ["The 256-bit merkle root."],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "vault",
            docs: ["vault pubkey that config is belong"],
            type: "publicKey",
          },
          {
            name: "version",
            docs: ["version"],
            type: "u64",
          },
          {
            name: "padding",
            docs: ["padding for further use"],
            type: {
              array: ["u128", 4],
            },
          },
        ],
      },
    },
    {
      name: "prorataVaultConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxBuyingCap",
            type: "u64",
          },
          {
            name: "startVestingDuration",
            type: "u64",
          },
          {
            name: "endVestingDuration",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 192],
            },
          },
        ],
      },
    },
    {
      name: "fcfsVaultConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxDepositingCap",
            type: "u64",
          },
          {
            name: "startVestingDuration",
            type: "u64",
          },
          {
            name: "endVestingDuration",
            type: "u64",
          },
          {
            name: "depositingSlotDurationUntilLastJoinSlot",
            type: "u64",
          },
          {
            name: "individualDepositingCap",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "padding",
            type: {
              array: ["u8", 176],
            },
          },
        ],
      },
    },
    {
      name: "vault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pool",
            docs: ["pool"],
            type: "publicKey",
          },
          {
            name: "tokenVault",
            docs: ["reserve quote token"],
            type: "publicKey",
          },
          {
            name: "tokenOutVault",
            docs: ["reserve base token"],
            type: "publicKey",
          },
          {
            name: "quoteMint",
            docs: ["quote token"],
            type: "publicKey",
          },
          {
            name: "baseMint",
            docs: ["base token"],
            type: "publicKey",
          },
          {
            name: "base",
            docs: ["base key"],
            type: "publicKey",
          },
          {
            name: "owner",
            docs: ["owner key, deprecated field, can re-use in the future"],
            type: "publicKey",
          },
          {
            name: "maxBuyingCap",
            docs: ["max buying cap"],
            type: "u64",
          },
          {
            name: "totalDeposit",
            docs: ["total deposited quote token"],
            type: "u64",
          },
          {
            name: "totalEscrow",
            docs: ["total user deposit"],
            type: "u64",
          },
          {
            name: "swappedAmount",
            docs: ["swapped_amount"],
            type: "u64",
          },
          {
            name: "boughtToken",
            docs: ["total bought token"],
            type: "u64",
          },
          {
            name: "totalRefund",
            docs: ["Total quote refund"],
            type: "u64",
          },
          {
            name: "totalClaimedToken",
            docs: ["Total claimed_token"],
            type: "u64",
          },
          {
            name: "startVestingSlot",
            docs: ["Start vesting ts"],
            type: "u64",
          },
          {
            name: "endVestingSlot",
            docs: ["End vesting ts"],
            type: "u64",
          },
          {
            name: "bump",
            docs: ["bump"],
            type: "u8",
          },
          {
            name: "poolType",
            docs: ["pool type"],
            type: "u8",
          },
          {
            name: "vaultMode",
            docs: ["vault mode"],
            type: "u8",
          },
          {
            name: "padding0",
            docs: ["padding 0"],
            type: {
              array: ["u8", 5],
            },
          },
          {
            name: "maxDepositingCap",
            docs: ["max depositing cap"],
            type: "u64",
          },
          {
            name: "individualDepositingCap",
            docs: ["individual depositing cap"],
            type: "u64",
          },
          {
            name: "depositingSlot",
            docs: ["depositing slot"],
            type: "u64",
          },
          {
            name: "escrowFee",
            docs: ["flat fee when user open an escrow"],
            type: "u64",
          },
          {
            name: "totalEscrowFee",
            docs: ["total escrow fee just for statistic"],
            type: "u64",
          },
          {
            name: "permissioned",
            docs: ["permissioned flag"],
            type: "u8",
          },
          {
            name: "padding1",
            docs: ["padding 1"],
            type: {
              array: ["u8", 7],
            },
          },
          {
            name: "padding",
            type: {
              array: ["u128", 7],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "CreateMerkleRootConfigParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "root",
            docs: ["The 256-bit merkle root."],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "version",
            docs: ["version"],
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FcfsConfigParameters",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxDepositingCap",
            type: "u64",
          },
          {
            name: "startVestingDuration",
            type: "u64",
          },
          {
            name: "endVestingDuration",
            type: "u64",
          },
          {
            name: "depositingSlotDurationUntilLastJoinSlot",
            type: "u64",
          },
          {
            name: "individualDepositingCap",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "index",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitializeFcfsVaultParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "poolType",
            type: "u8",
          },
          {
            name: "quoteMint",
            type: "publicKey",
          },
          {
            name: "baseMint",
            type: "publicKey",
          },
          {
            name: "depositingSlot",
            type: "u64",
          },
          {
            name: "startVestingSlot",
            type: "u64",
          },
          {
            name: "endVestingSlot",
            type: "u64",
          },
          {
            name: "maxDepositingCap",
            type: "u64",
          },
          {
            name: "individualDepositingCap",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "permissioned",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "UpdateFcfsVaultParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxDepositingCap",
            type: "u64",
          },
          {
            name: "depositingSlot",
            type: "u64",
          },
          {
            name: "individualDepositingCap",
            type: "u64",
          },
          {
            name: "startVestingSlot",
            type: "u64",
          },
          {
            name: "endVestingSlot",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ProrataConfigParameters",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxBuyingCap",
            type: "u64",
          },
          {
            name: "startVestingDuration",
            type: "u64",
          },
          {
            name: "endVestingDuration",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "index",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "InitializeProrataVaultParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "poolType",
            type: "u8",
          },
          {
            name: "quoteMint",
            type: "publicKey",
          },
          {
            name: "baseMint",
            type: "publicKey",
          },
          {
            name: "depositingSlot",
            type: "u64",
          },
          {
            name: "startVestingSlot",
            type: "u64",
          },
          {
            name: "endVestingSlot",
            type: "u64",
          },
          {
            name: "maxBuyingCap",
            type: "u64",
          },
          {
            name: "escrowFee",
            type: "u64",
          },
          {
            name: "permissioned",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "InitializeVaultWithConfigParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "poolType",
            type: "u8",
          },
          {
            name: "quoteMint",
            type: "publicKey",
          },
          {
            name: "baseMint",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "UpdateProrataVaultParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "maxBuyingCap",
            type: "u64",
          },
          {
            name: "startVestingSlot",
            type: "u64",
          },
          {
            name: "endVestingSlot",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "PoolType",
      docs: [
        "Type of the Pair. 0 = Permissionless, 1 = Permission. Putting 0 as permissionless for backward compatibility.",
      ],
      type: {
        kind: "enum",
        variants: [
          {
            name: "Dlmm",
          },
          {
            name: "DynamicPool",
          },
        ],
      },
    },
    {
      name: "VaultMode",
      docs: [
        "Vault Mode. 0 = Prorata, 1 = FirstComeFirstServe. Putting 0 as Prorata for backward compatibility.",
      ],
      type: {
        kind: "enum",
        variants: [
          {
            name: "Prorata",
          },
          {
            name: "Fcfs",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "ProrataVaultCreated",
      fields: [
        {
          name: "baseMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "quoteMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "startVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "endVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "maxBuyingCap",
          type: "u64",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "poolType",
          type: "u8",
          index: false,
        },
        {
          name: "escrowFee",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "FcfsVaultCreated",
      fields: [
        {
          name: "baseMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "quoteMint",
          type: "publicKey",
          index: false,
        },
        {
          name: "startVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "endVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "maxDepositingCap",
          type: "u64",
          index: false,
        },
        {
          name: "pool",
          type: "publicKey",
          index: false,
        },
        {
          name: "poolType",
          type: "u8",
          index: false,
        },
        {
          name: "depositingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "individualDepositingCap",
          type: "u64",
          index: false,
        },
        {
          name: "escrowFee",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowCreated",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "vaultTotalEscrow",
          type: "u64",
          index: false,
        },
        {
          name: "escrowFee",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "MerkleRootConfigCreated",
      fields: [
        {
          name: "admin",
          type: "publicKey",
          index: false,
        },
        {
          name: "config",
          type: "publicKey",
          index: false,
        },
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "verstion",
          type: "u64",
          index: false,
        },
        {
          name: "root",
          type: {
            array: ["u8", 32],
          },
          index: false,
        },
      ],
    },
    {
      name: "ProrataVaultParametersUpdated",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "maxBuyingCap",
          type: "u64",
          index: false,
        },
        {
          name: "startVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "endVestingSlot",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "FcfsVaultParametersUpdated",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "maxDepositingCap",
          type: "u64",
          index: false,
        },
        {
          name: "startVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "endVestingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "depositingSlot",
          type: "u64",
          index: false,
        },
        {
          name: "individualDepositingCap",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowRemainingWithdraw",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "vaultRemainingDeposit",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowWithdraw",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "vaultTotalDeposit",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "SwapFill",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "pair",
          type: "publicKey",
          index: false,
        },
        {
          name: "fillAmount",
          type: "u64",
          index: false,
        },
        {
          name: "purchasedAmount",
          type: "u64",
          index: false,
        },
        {
          name: "unfilledAmount",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowDeposit",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "vaultTotalDeposit",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowClosed",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "vaultTotalEscrow",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "EscrowClaimToken",
      fields: [
        {
          name: "vault",
          type: "publicKey",
          index: false,
        },
        {
          name: "escrow",
          type: "publicKey",
          index: false,
        },
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "amount",
          type: "u64",
          index: false,
        },
        {
          name: "vaultTotalClaimedToken",
          type: "u64",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "StartSlotAfterEnd",
      msg: "start slot is after end slot",
    },
    {
      code: 6001,
      name: "SlotNotInFuture",
      msg: "slot is not in future",
    },
    {
      code: 6002,
      name: "IncorrectTokenMint",
      msg: "token mint is incorrect",
    },
    {
      code: 6003,
      name: "IncorrectPairType",
      msg: "pair is not permissioned",
    },
    {
      code: 6004,
      name: "PoolHasStarted",
      msg: "Pool has started",
    },
    {
      code: 6005,
      name: "NotPermitThisActionInThisSlot",
      msg: "This action is not permitted in this slot",
    },
    {
      code: 6006,
      name: "TheSaleIsOngoing",
      msg: "the sale is on going, cannot withdraw",
    },
    {
      code: 6007,
      name: "EscrowIsNotClosable",
      msg: "Escrow is not closable",
    },
    {
      code: 6008,
      name: "SlotOrdersAreIncorrect",
      msg: "Slot orders are incorrect",
    },
    {
      code: 6009,
      name: "EscrowHasRefuned",
      msg: "Escrow has refunded",
    },
    {
      code: 6010,
      name: "MathOverflow",
      msg: "Math operation overflow",
    },
    {
      code: 6011,
      name: "MaxBuyingCapIsZero",
      msg: "Max buying cap is zero",
    },
    {
      code: 6012,
      name: "MaxAmountIsTooSmall",
      msg: "Max amount is too small",
    },
    {
      code: 6013,
      name: "PoolTypeIsNotSupported",
      msg: "Pool type is not supported",
    },
    {
      code: 6014,
      name: "InvalidAdmin",
      msg: "Invalid admin",
    },
    {
      code: 6015,
      name: "VaultModeIsIncorrect",
      msg: "Vault mode is incorrect",
    },
    {
      code: 6016,
      name: "MaxDepositingCapIsInValid",
      msg: "Max depositing cap is invalid",
    },
    {
      code: 6017,
      name: "VestingDurationIsInValid",
      msg: "Vesting duration is invalid",
    },
    {
      code: 6018,
      name: "DepositAmountIsZero",
      msg: "Deposit amount is zero",
    },
    {
      code: 6019,
      name: "PoolOwnerIsMismatched",
      msg: "Pool owner is mismatched",
    },
    {
      code: 6020,
      name: "RefundAmountIsZero",
      msg: "Refund amount is zero",
    },
    {
      code: 6021,
      name: "DepositingSlotDurationIsInvalid",
      msg: "Depositing slot duration is invalid",
    },
    {
      code: 6022,
      name: "DepositingSlotIsInvalid",
      msg: "Depositing slot is invalid",
    },
    {
      code: 6023,
      name: "IndividualDepositingCapIsZero",
      msg: "Individual depositing cap is zero",
    },
    {
      code: 6024,
      name: "InvalidFeeReceiverAccount",
      msg: "Invalid fee receiver account",
    },
    {
      code: 6025,
      name: "NotPermissionedVault",
      msg: "Not permissioned vault",
    },
    {
      code: 6026,
      name: "NotPermitToDoThisAction",
      msg: "Not permit to do this action",
    },
    {
      code: 6027,
      name: "InvalidProof",
      msg: "Invalid Merkle proof.",
    },
  ],
};
