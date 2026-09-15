import { Keypair, Horizon, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function fundAccount(publicKey) {
  console.log(`Funding account ${publicKey} via Friendbot...`);
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) {
    throw new Error(`Friendbot failed with status ${res.status}: ${await res.text()}`);
  }
  console.log(`Funded ${publicKey} successfully!`);
}

async function main() {
  // 1. Generate keys for Issuer, Sender (Worker), and Recipient
  const issuer = Keypair.random();
  const sender = Keypair.random();
  const recipient = Keypair.random();

  console.log('--- GENERATED ACCOUNTS ---');
  console.log('Issuer:', issuer.publicKey());
  console.log('Sender (Worker):', sender.publicKey());
  console.log('Recipient (ADDRESS_X):', recipient.publicKey());

  // 2. Fund all accounts on Testnet
  await fundAccount(issuer.publicKey());
  await fundAccount(sender.publicKey());
  await fundAccount(recipient.publicKey());

  const usdcAsset = new Asset('USDC', issuer.publicKey());

  // 3. Establish trustlines for USDC on sender and recipient
  console.log('Setting up trustlines for USDC...');
  
  // Recipient trustline
  let recipientAccount = await server.loadAccount(recipient.publicKey());
  let txTrustRecipient = new TransactionBuilder(recipientAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: usdcAsset }))
    .setTimeout(60)
    .build();
  txTrustRecipient.sign(recipient);
  await server.submitTransaction(txTrustRecipient);
  console.log('Recipient trustline established.');

  // Sender trustline
  let senderAccount = await server.loadAccount(sender.publicKey());
  let txTrustSender = new TransactionBuilder(senderAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: usdcAsset }))
    .setTimeout(60)
    .build();
  txTrustSender.sign(sender);
  await server.submitTransaction(txTrustSender);
  console.log('Sender trustline established.');

  // 4. Issuer mints/sends 100 USDC to Sender
  console.log('Issuer minting 100 USDC to sender...');
  let issuerAccount = await server.loadAccount(issuer.publicKey());
  let txMint = new TransactionBuilder(issuerAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: sender.publicKey(),
        asset: usdcAsset,
        amount: '100.0',
      })
    )
    .setTimeout(60)
    .build();
  txMint.sign(issuer);
  await server.submitTransaction(txMint);
  console.log('Sender received 100 USDC.');

  // 5. Transaction 1: DECEPTIVE TRANSACTION (Transfers 0.5 USDC to recipient)
  console.log('Submitting DECEPTIVE transaction (0.5 USDC)...');
  senderAccount = await server.loadAccount(sender.publicKey());
  let txDeceptive = new TransactionBuilder(senderAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: recipient.publicKey(),
        asset: usdcAsset,
        amount: '0.5000000',
      })
    )
    .setTimeout(60)
    .build();
  txDeceptive.sign(sender);
  const resDeceptive = await server.submitTransaction(txDeceptive);
  console.log('>>> DECEPTIVE TX HASH (0.5 USDC):', resDeceptive.hash);

  // 6. Transaction 2: CORRECT TRANSACTION (Transfers 5.0 USDC to recipient)
  console.log('Submitting CORRECT transaction (5.0 USDC)...');
  senderAccount = await server.loadAccount(sender.publicKey());
  let txCorrect = new TransactionBuilder(senderAccount, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: recipient.publicKey(),
        asset: usdcAsset,
        amount: '5.0000000',
      })
    )
    .setTimeout(60)
    .build();
  txCorrect.sign(sender);
  const resCorrect = await server.submitTransaction(txCorrect);
  console.log('>>> CORRECT TX HASH (5.0 USDC):', resCorrect.hash);

  console.log('\n=============================================');
  console.log('SUMMARY OF REAL STELLAR TESTNET ARTIFACTS:');
  console.log(JSON.stringify({
    issuer: issuer.publicKey(),
    sender: sender.publicKey(),
    recipient: recipient.publicKey(),
    deceptiveTxHash: resDeceptive.hash,
    deceptiveAmount: '0.5',
    correctTxHash: resCorrect.hash,
    correctAmount: '5.0',
    assetCode: 'USDC',
  }, null, 2));
  console.log('=============================================');
}

main().catch(console.error);
