import { IEmployee, Employee } from "employees-contract";
import * as FabricCAServices from "fabric-ca-client";
import { InMemoryWallet, X509WalletMixin, Gateway, Network, Contract } from "fabric-network";
import { readFile } from "fs-extra";
import "mocha";
import * as path from "path";

import ConnectionConfig from "../types/connection-config";
import { ok, strictEqual, deepStrictEqual } from "assert";

const wallet = new InMemoryWallet();
const userGateway = new Gateway();

let connectionConfig: ConnectionConfig;
let contract: Contract;

before(async () => {
	const ccpPath = path.resolve(__dirname, '..', '..', 'connection.json');
	connectionConfig = await readFile(ccpPath, 'utf-8').then((res) => JSON.parse(res));
});

it('enroll admin', async () => {
	const caService = new FabricCAServices(connectionConfig.certificateAuthorities['ca.example.com'].url);
	const enrollment = await caService.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
	const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
	await wallet.import('admin', identity);
});

it('register user', async () => {
	const adminGateway = new Gateway();
	await adminGateway.connect(connectionConfig, {
		wallet,
		identity: 'admin',
		discovery: { enabled: false },
	});
	const certificateAuthority = adminGateway.getClient().getCertificateAuthority();
	const adminIdentity = adminGateway.getCurrentIdentity();
	const secret = await certificateAuthority.register(
		{ affiliation: 'org1.department1', enrollmentID: 'user1', role: 'client' },
		adminIdentity,
	);
	const enrollment = await certificateAuthority.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
	const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
	await wallet.import('user1', userIdentity);
	await userGateway.connect(connectionConfig, { wallet, identity: 'user1', discovery: { enabled: false } });
	const network = await userGateway.getNetwork('mychannel');
	contract = network.getContract('employees');
});

it('get all employees', async () => {
	const res = await contract.evaluateTransaction('getAllEmployees')
		.then((res) => JSON.parse(res.toString()) as Array<IEmployee>)
	ok(Array.isArray(res), 'result is not an array');
	strictEqual(res.length, 1);
	deepStrictEqual(res[0], { age: 22, firstName: 'Mikhail', secondName: 'Shautsou' } as IEmployee);
});

it('create employee', async () => {
	const nick = new Employee('Nick', 'Latkovich', 22);
	await contract.submitTransaction('createEmployee', JSON.stringify(nick));
	const res = await contract.evaluateTransaction('getAllEmployees')
		.then((res) => JSON.parse(res.toString()) as Array<IEmployee>)
	ok(Array.isArray(res), 'result is not an array');
	strictEqual(res.length, 2);
	deepStrictEqual(res, [
		{ age: 22, firstName: 'Mikhail', secondName: 'Shautsou' } as IEmployee,
		{ age: 22, firstName: 'Nick', secondName: 'Latkovich' } as IEmployee,
	]);
}).timeout(7e3);
