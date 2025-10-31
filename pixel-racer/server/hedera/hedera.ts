import {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  AccountId,
  TokenId,
} from "@hashgraph/sdk";
import { Buffer } from "buffer";

const OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID || "");
const OPERATOR_KEY = PrivateKey.fromStringDer(process.env.OPERATOR_KEY || "");
const contractId = process.env.CONTRACT_ID || "";
const TOKEN_ID = TokenId.fromString(process.env.TOKEN_ID || "");
const client = Client.forName("testnet").setOperator(OPERATOR_ID, OPERATOR_KEY);

export async function createToken() {
  const createToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setPayableAmount(50)
    .setFunction(
      "createNft",
      new ContractFunctionParameters()
        .addString("Pixel Racer")
        .addString("PIXEL")
        .addString("Pixel Racer NFT")
        .addInt64(500)
        .addInt64(7000000)
    );
  const createTokenTx = await createToken.execute(client);
  const createTokenRx = await createTokenTx.getRecord(client);
  const tokenIdSolidityAddr =
    createTokenRx.contractFunctionResult?.getAddress(0);

  if (!tokenIdSolidityAddr) {
    throw new Error("Failed to create token");
  }
  const tokenId = AccountId.fromEvmAddress(0, 0, tokenIdSolidityAddr);

  console.log(`Token created with ID: ${tokenId.toString()} \n`);
  return tokenId.toString();
}

export async function mintNft(receiverAddress: string) {
  const cid = await getNewCID();
  const mintToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setMaxTransactionFee(new Hbar(20))
    .setFunction(
      "mintNft",
      new ContractFunctionParameters()
        .addAddress(TOKEN_ID.toEvmAddress())
        .addBytesArray([Buffer.from(`ipfs://${cid}`)])
    );

  const mintTokenTx = await mintToken.execute(client);
  const mintTokenRx = await mintTokenTx.getRecord(client);
  const serial = mintTokenRx.contractFunctionResult?.getInt64(0);

  if (!serial) {
    throw new Error("Failed to mint NFT");
  }

  const transferToken = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(4000000)
    .setFunction(
      "transferNft",
      new ContractFunctionParameters()
        .addAddress(TOKEN_ID.toEvmAddress())
        .addAddress(receiverAddress)
        .addInt64(serial)
    );

  const transferTokenTx = await transferToken.execute(client);
  const transferTokenRx = await transferTokenTx.getReceipt(client);

  console.log(`Transfer transaction ID: ${transferTokenTx.transactionId} \n`);
  console.log(`Transfer status: ${transferTokenRx.status} \n`);

  return serial;
}

async function getNewCID() {
  const response = await fetch(
    `${process.env.CID_SERVICE}/api/cid?game=pixel-racer`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch new CID: ${response.statusText}`);
  }
  const data = await response.json();
  return data.cid as string;
}
