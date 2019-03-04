import { FileSystemWallet, Gateway, X509WalletMixin } from "fabric-network";
import { readFile } from "fs-extra"
import * as path from "path";

const ccpPath = path.resolve(__dirname, '../../basic-network/connection.json');

(async () => {
	const ccpJSON = await readFile(ccpPath, 'utf8');
	const ccp = JSON.parse(ccpJSON);
	const walletPath = path.join(process.cwd(), 'wallet');
	const wallet = new FileSystemWallet(walletPath);
	console.log(`Wallet path: ${walletPath}`);
	const userExists = await wallet.exists('user1');
	if (userExists) {
		console.log('An identity for the user "user1" already exists in the wallet');
		return;
	}
	const adminExists = await wallet.exists('admin');
	if (!adminExists) {
		console.log('An identity for the admin user "admin" does not exist in the wallet');
		console.log('Run the enrollAdmin.ts application before retrying');
		return;
	}
	const gateway = new Gateway();
	await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });
	const ca = gateway.getClient().getCertificateAuthority();
	const adminIdentity = gateway.getCurrentIdentity();
	const secret = await ca.register(
		{ affiliation: 'org1.department1', enrollmentID: 'user1', role: 'client' },
		adminIdentity,
	);
	const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
	const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
	await wallet.import('user1', userIdentity);
	console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');
})().then(() => process.exit(0)).catch((error) => {
	console.error(`Failed to register user "user1": ${error}`);
	process.exit(1);
});
