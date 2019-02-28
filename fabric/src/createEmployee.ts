import { FileSystemWallet, Gateway } from "fabric-network";
import { Employee } from "employees-contract";
import { readFile } from "fs-extra";
import * as path from "path";

const ccpPath = path.resolve(__dirname, '../../basic-network/connection.json');
(async () => {
	const ccpJSON = await readFile(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
	const walletPath = path.join(process.cwd(), 'wallet');
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);
	const userExists = await wallet.exists('user1');
	if (!userExists) {
		console.log('An identity for the user "user1" does not exist in the wallet');
		console.log('Run the registerUser.ts application before retrying');
		return;
	}
	const gateway = new Gateway();
	await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
	const network = await gateway.getNetwork('mychannel');
	const contract = network.getContract('employees');
	await contract.submitTransaction
})().then(() => process.exit(0)).catch((error) => {
	console.error(`Failed to evaluate transaction: ${error}`);
	process.exit(1);
});
