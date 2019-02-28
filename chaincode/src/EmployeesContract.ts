import { Contract, Context } from "fabric-contract-api";
import OriginalBigNumber from "bignumber.js";
import Employee, { IEmployee } from "./Employee";
import { ok } from "assert";

class BN extends OriginalBigNumber {
	toJSON(): string { return this.toString(10); }
	static fromJSON(value: number | string) { return new BN(value, 10); }
}

const EMPLOYEES_COUNT_FIELD = 'EMPLOYEES_COUNT';

function getEmployeeField(employeeIndex: number | BN): string { return `EMPLOYEE_${employeeIndex.toString()}`; }

function bnToBuffer(num: BN) {
	ok(num.isInteger(), 'num is not a integer');
	ok(num.gte(0), 'num is negative');
	let hex = num.toString(16);
	if (hex.length % 2) hex = `0${hex}`;
	return Buffer.from(hex, 'hex');
}

export default class EmployeesContract extends Contract {

	constructor() { super('EmployeesContract'); }

	public async getEmployeesCount(ctx: Context): Promise<BN> {
		return await ctx.stub.getState(EMPLOYEES_COUNT_FIELD)
			.then((res) => new BN(res.toString('hex'), 16));
	}

	public async initLedger(ctx: Context): Promise<void> {
		const mShautsou = new Employee('Mikhail', 'Shautsou', 22);
		await Promise.all([
			ctx.stub.putState(EMPLOYEES_COUNT_FIELD, bnToBuffer(new BN(1))),
			ctx.stub.putState(getEmployeeField(0), mShautsou.toBuffer()),
		]);
	}

	public async getEmployee(ctx: Context, index: number | string | BN): Promise<Employee> {
		if (!(index instanceof BN)) index = BN.fromJSON(index);
		const employeesCount = await this.getEmployeesCount(ctx);
		ok(employeesCount.gt(index), 'no employee with provided index');
		return await ctx.stub.getState(getEmployeeField(index)).then((res) => Employee.fromBuffer(res));
	}

	public async getAllEmployees(ctx: Context): Promise<Array<Employee>> {
		const employeesCount = await this.getEmployeesCount(ctx);
		ok(employeesCount.lte(Number.MAX_SAFE_INTEGER), 'too much employees');
		return await Promise.all(new Array(employeesCount.toNumber()).fill(null).map(async (_, i) => {
			return await this.getEmployee(ctx, i);
		}));
	}

	public async createEmployee(ctx: Context, params: IEmployee): Promise<void> {
		const employee = Employee.fromJSON(params);
		const employeesCount = await this.getEmployeesCount(ctx);
		await Promise.all([
			ctx.stub.putState(EMPLOYEES_COUNT_FIELD, bnToBuffer(employeesCount.plus(1))),
			ctx.stub.putState(getEmployeeField(employeesCount), employee.toBuffer()),
		]);
	}

}
