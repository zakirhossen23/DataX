// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
//   import fs from 'mz/fs.js';
//   import path from 'path';

import { deserializeUnchecked } from 'borsh';

import { createKeypairFromFile, getPayerFromFile } from './utils.mjs';

/**
 * Connection to the network
 */
let connection;


// Derive the address (public key) of a user account from the program so that it's easy to find later.
const SEED = "Hello";

/**
 * Our program id
 */
let programId;
let BackendKeyPair;


/**
 * The public key of the user account
 */
let userPubkey;
let BaseUserPubkey;


// Flexible class that takes properties and imbues them
// to the object instance
class Assignable {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

export class AccoundData extends Assignable { }

const dataSchema = new Map([
  [
    AccoundData,
    {
      kind: "struct",
      fields: [
        ["initialized", "u8"],
        ["tree_length", "u32"],
        ["map", { kind: 'map', key: 'string', value: 'string' }]
      ]
    }
  ]
]);
/**
* Establish a connection to the cluster
*/
export async function establishConnection() {
  const rpcUrl = "https://api.devnet.solana.com";
  connection = new Connection(rpcUrl, 'confirmed');
  BaseUserPubkey = window.solflare.publicKey;
}



/**
 * Check if the program has been deployed
 */
export async function checkProgram() {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile();
    BackendKeyPair = await getPayerFromFile();
    programId = programKeypair.publicKey;
  } catch (err) {
    console.error(err);

  }
  const programInfo = await connection.getAccountInfo(programId);

  if (programInfo === null) {
    throw new Error(
      'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
    );
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }

  await establishPayer();
  await CreateNewPDA(true);

}


/**
 * Establish an account to pay for everything
 */
export async function establishPayer() {
  let fees = 0;

  const { feeCalculator } = await connection.getRecentBlockhash();

  // Calculate the cost to fund the greeter account
  fees += await connection.getMinimumBalanceForRentExemption(4000000);

  // Calculate the cost of sending transactions
  fees += feeCalculator.lamportsPerSignature * 100; // wag


  let lamports = await connection.getBalance(BackendKeyPair.publicKey);
  if (lamports < fees) {
    try {
      // If current balance is not enough to pay for fees, request an airdrop
      const sig = await connection.requestAirdrop(
        BackendKeyPair.publicKey,
        1,
      );
      await connection.confirmTransaction(sig);
    } catch (error) { }

  }

}



export async function CreateNewPDA(checkMode = false) {


  userPubkey = await PublicKey.createWithSeed(
    BackendKeyPair.publicKey,
    SEED,
    programId,
  );

  let data = null;
  try {
    data = await getOutput();
    return;
  } catch (err) { }

  let Space = 4000000;
  const lamports = await connection.getMinimumBalanceForRentExemption(Space);

  const transaction = new Transaction().add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: BackendKeyPair.publicKey,
      basePubkey: BackendKeyPair.publicKey,
      seed: SEED,
      newAccountPubkey: userPubkey,
      lamports: lamports,
      space: Space,
      programId: programId,
    }),
  );
  await sendAndConfirmTransaction(connection, transaction, [BackendKeyPair]);
  console.log("chreated new PDA");
}


/**
 * Initializing Sate
 */
export async function InitializeState() {
  console.log('Initializing', programId.toBase58());

  let instruction_data = {
    "method": "Initialize"
  }
  let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");


  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userPubkey, isSigner: false, isWritable: true },
    ],
    programId: programId,
    data: Uint8Array.from(buffer_instruction),
  });

  let signature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(
      instruction),
    [BackendKeyPair],
  );


  const txdata = await connection.getParsedTransaction(signature);


}



export async function getAccountData(connection, account) {
  let nameAccount = await connection.getAccountInfo(
    account,
    'processed'
  );
  return deserializeUnchecked(dataSchema, AccoundData, nameAccount.data);
}



/**
 * Get Output
 */
export async function getOutput() {
  const account = await getAccountData(connection, userPubkey);
  return account;

}



/**
 * Update Data Inside Program
 */
export async function UpdateOrInsertData(key, value) {

  let instruction_data = {
    "method": "UpdateOrInsert",
    "args": [key, value]
  }
  let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");


  const instruction = new TransactionInstruction({
    programId: programId,
    keys: [
      { pubkey: userPubkey, isSigner: false, isWritable: true },
    ],
    data: Uint8Array.from(buffer_instruction), // All instructions are hellos
  });
  const transaction = new Transaction().add(instruction);

  let { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = BaseUserPubkey;

  const signedTransaction = await window.solflare.signTransaction(transaction);
  let signature = await connection.sendRawTransaction(signedTransaction.serialize());


  const txdata = await connection.getParsedTransaction(signature);

}
