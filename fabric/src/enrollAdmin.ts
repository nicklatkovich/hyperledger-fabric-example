import * as FabricCAServices from "fabric-ca-client";
import { FileSystemWallet, X509WalletMixin } from "fabric-network";
import { readFile } from "fs-extra";
import * as path from "path";

const ccpPath = path.resolve(__dirname, '../../network/connection.json');

(async () => {
	const ccp = await readFile(ccpPath, 'utf8').then((res) => JSON.parse(res));
	const caURL = ccp.certificateAuthorities['ca.example.com'].url;
	const ca = new FabricCAServices(caURL);
	const walletPath = path.join(__dirname, '../wallet');
	console.log(`Wallet path: ${walletPath}`);
	const wallet = new FileSystemWallet(walletPath);
	const adminExists = await wallet.exists('admin');
	if (adminExists) {
		console.log('An identity for the admin user "admin" already exists in the wallet');
		return;
	}
	const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
	const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
	await wallet.import('admin', identity);
	console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
})().then(() => process.exit(0)).catch((error) => {
	console.error(`Failed to enroll admin user "admin": ${error}`);
	process.exit(1);
});
