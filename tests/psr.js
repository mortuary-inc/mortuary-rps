const anchor = require('@project-serum/anchor');
const createKeccakHash = require('keccak');

const { SystemProgram } = anchor.web3;

function hash(string) {
  return createKeccakHash('keccak256').update(string).digest().toString('hex');
}

// documentation is kinda weak for createKeccakHash
function hashArray(string) {
  let hash = createKeccakHash('keccak256').update(string).digest().toString('hex');
  let array = hash.match(/(..?)/g);
  return array.map(x => parseInt(x,16));
}
function byteArrayToString(byteArray) {
  var result = "";
  for (var i = 0; i < byteArray.length; i++) {
    result += String.fromCharCode(parseInt(byteArray[i], 16));
  }
  return result;
}

describe('psr', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Psr;
  const controller_account = anchor.web3.Keypair.generate();
  const player_two = anchor.web3.Keypair.generate();

  console.log(program.rpc);
  console.log("P1 PUBLIC KEY :",provider.wallet.publicKey);
  console.log("P2 PUBLIC KEY :",player_two.publicKey);

  // it("test hash", async () => {
  //   await program.rpc.testHash("0SALT");
  // })

  /*
  'Program log: input is test',
  'Program log: hash is [156, 34, 255, 95, 33, 240, 184, 27, 17, 62, 99, 247, 219, 109, 169, 79, 237, 239, 17, 178, 17, 155, 64, 136, 184, 150, 100, 251, 154, 60, 182, 88]',  // <Buffer 9c 22 ff 5f 21 f0 b8 1b 11 3e 63 f7 db 6d a9 4f ed ef 11 b2 11 9b 40 88 b8 96 64 fb 9a 3c b6 58> - hash("test")
  console.log(hashArray('test'));
                        [156, 34, 255, 95, 33, 240, 184, 27, 17, 62, 99, 247, 219, 109, 169, 79, 237, 239, 17, 178, 17, 155, 64, 136, 184, 150, 100, 251, 154, 60, 182, 88]
  // the hashes do work but array is a problem
]
  // they are the same but need to convert hash('test') into bytes to pass it in
  */
  it('initialise accounts', async () => {
    await program.rpc.initialiseController({
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : provider.wallet.publicKey,
        systemProgram : SystemProgram.programId,
      },
      signers : [controller_account],
    });
  });

  it('connect player two', async() => {
    await program.rpc.connect({
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : player_two.publicKey,
      },
      signers : [player_two],
    });
  });

  // might change program to only allow strings
  // commits paper
  it('player one commits', async() => {
    await program.rpc.commit(hashArray("0SALT"),{
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : provider.wallet.publicKey,
      },
    });
  });  

  // commits rock
  // player 1 should win
  it('player two commits', async() => {
    await program.rpc.commit(hashArray("2SALT"),{
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : player_two.publicKey,
      },
      signers : [player_two],
    });
  })

  // reveal

  it('player one reveals', async() => {
    
    await program.rpc.reveal("0SALT", {
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : provider.wallet.publicKey,
      },
    });
  });

  it('player two reveals', async() => {
    await program.rpc.reveal("2SALT", {
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : player_two.publicKey,
      },
      signers : [player_two],
    });
  });

  it('player one claims', async() => {
    await program.rpc.claim({
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : provider.wallet.publicKey,
      },
    });
  });

  it('player two resets', async() => {
    await program.rpc.reset({
      accounts: {
        controllerAccount : controller_account.publicKey,
        user : player_two.publicKey,
      },
      signers : [player_two]
    });
    console.log(program.account);
    const account = await program.account.controllerAccount.fetch(controller_account.publicKey);
    console.log(account.lastLoser._bn);
  });



});
