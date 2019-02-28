import { FileSystemWallet, Gateway } from "fabric-network";
import { Employee } from "employees-contract";
import { readFile } from "fs-extra";
import * as path from "path";
import { inspect } from "util";

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
	const employeesCount: number = await contract.evaluateTransaction('getEmployeesCount')
		.then((res) => JSON.parse(res.toString()));
	console.log('employess_count:', employeesCount)
	const employees = await Promise.all(new Array(employeesCount).fill(null).map(async (_, i) => {
		const indexHex = i.toString(16);
		return await contract.evaluateTransaction('getEmployee', indexHex.padStart(Math.ceil(indexHex.length / 2)))
			.then((res) => Employee.fromJSON(res));
	}));
	console.log('employees', employees);
	console.log('Transaction has been evaluated');
})().then(() => process.exit(0)).catch((error) => {
	console.error(`Failed to evaluate transaction: ${error}`);
	process.exit(1);
});
