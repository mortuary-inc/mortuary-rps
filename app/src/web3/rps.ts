export type Rps = {
  "version": "0.1.0",
  "name": "rps",
  "instructions": [
    {
      "name": "initBank",
      "accounts": [
        {
          "name": "bankConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bankMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceedsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerOneTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "duration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "matchGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shape",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revealGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerOneTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "history",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shape",
          "type": "u8"
        },
        {
          "name": "secret",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "terminateGame",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "history",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "recover",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "bankConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receptor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bankConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "bank",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "tax",
            "type": "u8"
          },
          {
            "name": "taxDraw",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "gameId",
            "type": "publicKey"
          },
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": "publicKey"
          },
          {
            "name": "playerOneTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "playerTwoTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "playerOneCommitted",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerOneRevealed",
            "type": {
              "option": {
                "defined": "Shape"
              }
            }
          },
          {
            "name": "playerTwoRevealed",
            "type": {
              "option": {
                "defined": "Shape"
              }
            }
          },
          {
            "name": "stage",
            "type": {
              "defined": "Stage"
            }
          },
          {
            "name": "lastUpdate",
            "type": "i64"
          },
          {
            "name": "duration",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "gameHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "u8"
          },
          {
            "name": "bid",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Shape",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paper"
          },
          {
            "name": "Scissor"
          },
          {
            "name": "Rock"
          }
        ]
      }
    },
    {
      "name": "Stage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Start"
          },
          {
            "name": "Match"
          },
          {
            "name": "Reveal"
          },
          {
            "name": "Terminate"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "HashDontMatch",
      "msg": "Your combinaison (secret+weapon) doesn't match what you played when you created the game."
    },
    {
      "code": 6001,
      "name": "InvalidAdmin",
      "msg": "Invalid admin account provided."
    },
    {
      "code": 6002,
      "name": "GameNotStart",
      "msg": "Invalid game state (Start) for operation"
    },
    {
      "code": 6003,
      "name": "GameNotMatch",
      "msg": "Invalid game state (Match) for operation"
    },
    {
      "code": 6004,
      "name": "GameNotReveal",
      "msg": "Invalid game state (Reveal) for operation"
    },
    {
      "code": 6005,
      "name": "GameNotClaim",
      "msg": "Invalid game state (Claim) for operation"
    },
    {
      "code": 6006,
      "name": "GameNotComplete",
      "msg": "Invalid game state (Complete) for operation"
    },
    {
      "code": 6007,
      "name": "GameNotCancel",
      "msg": "Invalid game state (Cancel) for operation"
    },
    {
      "code": 6008,
      "name": "IncorrectOwner",
      "msg": "Invalid account owner"
    },
    {
      "code": 6009,
      "name": "NumericalOverflow",
      "msg": "Numerical Overflow"
    },
    {
      "code": 6010,
      "name": "GameExpired",
      "msg": "Game is expired"
    },
    {
      "code": 6011,
      "name": "GameLive",
      "msg": "Game is live"
    }
  ]
};

export const IDL: Rps = {
  "version": "0.1.0",
  "name": "rps",
  "instructions": [
    {
      "name": "initBank",
      "accounts": [
        {
          "name": "bankConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bankMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameId",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceedsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerOneTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "duration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "matchGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shape",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revealGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerOneTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "history",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "shape",
          "type": "u8"
        },
        {
          "name": "secret",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "terminateGame",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerTwoTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "history",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "recover",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proceeds",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "bankConfig",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bank",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receptor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bankConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "bank",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "tax",
            "type": "u8"
          },
          {
            "name": "taxDraw",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "gameId",
            "type": "publicKey"
          },
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": "publicKey"
          },
          {
            "name": "playerOneTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "playerTwoTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "playerOneCommitted",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerOneRevealed",
            "type": {
              "option": {
                "defined": "Shape"
              }
            }
          },
          {
            "name": "playerTwoRevealed",
            "type": {
              "option": {
                "defined": "Shape"
              }
            }
          },
          {
            "name": "stage",
            "type": {
              "defined": "Stage"
            }
          },
          {
            "name": "lastUpdate",
            "type": "i64"
          },
          {
            "name": "duration",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "gameHistory",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "u32"
          },
          {
            "name": "winner",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "u8"
          },
          {
            "name": "bid",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Shape",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Paper"
          },
          {
            "name": "Scissor"
          },
          {
            "name": "Rock"
          }
        ]
      }
    },
    {
      "name": "Stage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Start"
          },
          {
            "name": "Match"
          },
          {
            "name": "Reveal"
          },
          {
            "name": "Terminate"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "HashDontMatch",
      "msg": "Your combinaison (secret+weapon) doesn't match what you played when you created the game."
    },
    {
      "code": 6001,
      "name": "InvalidAdmin",
      "msg": "Invalid admin account provided."
    },
    {
      "code": 6002,
      "name": "GameNotStart",
      "msg": "Invalid game state (Start) for operation"
    },
    {
      "code": 6003,
      "name": "GameNotMatch",
      "msg": "Invalid game state (Match) for operation"
    },
    {
      "code": 6004,
      "name": "GameNotReveal",
      "msg": "Invalid game state (Reveal) for operation"
    },
    {
      "code": 6005,
      "name": "GameNotClaim",
      "msg": "Invalid game state (Claim) for operation"
    },
    {
      "code": 6006,
      "name": "GameNotComplete",
      "msg": "Invalid game state (Complete) for operation"
    },
    {
      "code": 6007,
      "name": "GameNotCancel",
      "msg": "Invalid game state (Cancel) for operation"
    },
    {
      "code": 6008,
      "name": "IncorrectOwner",
      "msg": "Invalid account owner"
    },
    {
      "code": 6009,
      "name": "NumericalOverflow",
      "msg": "Numerical Overflow"
    },
    {
      "code": 6010,
      "name": "GameExpired",
      "msg": "Game is expired"
    },
    {
      "code": 6011,
      "name": "GameLive",
      "msg": "Game is live"
    }
  ]
};
