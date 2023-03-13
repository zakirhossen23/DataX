import { Abi, ContractPromise } from '@polkadot/api-contract'
import abiData from './ink_contracts//metadata.json';


const address = 'Zxnt9BCBjhWXdNbHizbbZAM7W3UdhKfXj16GAo3PNzQDfd6'//smart contract deployed address 
	
export default async function getContract(api) {


    const abi = new Abi(abiData, api.registry.getChainProperties())

    const contract = new ContractPromise(api, abi, address)

	return contract
  }
  