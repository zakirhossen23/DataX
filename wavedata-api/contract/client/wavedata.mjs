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
    data: Uint8Array.from(buffer_instruction),
  });

  
  const transaction = new Transaction().add(instruction);

  await sendAndConfirmTransaction(connection, transaction, [BackendKeyPair]);


}
