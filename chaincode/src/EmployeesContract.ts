import { Contract, Context } from "fabric-contract-api";
import Employee from "./Employee";
import { ok } from "assert";

const EMPLOYEES_COUNT_FIELD = 'EMPLOYEES_COUNT';

function getEmployeeField(employeeIndex: number): string { return `EMPLOYEE_${employeeIndex}`; }

export default class EmployeesContract extends Contract {

	constructor() { super('EmployeesContract'); }

	public async getEmployeesCount(ctx: Context): Promise<number> {
		return await ctx.stub.getState(EMPLOYEES_COUNT_FIELD)
			.then((res) => Number.parseInt(res.toString('hex'), 16));
	}

	public async initLedger(ctx: Context): Promise<void> {
		const mShautsou = new Employee('Mikhail', 'Shautsou', 22);
		console.log(Buffer.from([1]));
		await Promise.all([
			ctx.stub.putState(EMPLOYEES_COUNT_FIELD, Buffer.from([1])),
			ctx.stub.putState(getEmployeeField(0), mShautsou.toBuffer()),
		]);
	}

	public async getEmployee(ctx: Context, indexBytecode: Buffer): Promise<Employee> {
		const index = Number.parseInt(indexBytecode.toString('hex'), 16);
		const employeesCount = await this.getEmployeesCount(ctx);
		ok(employeesCount > index, 'no employee with provided index');
		return await ctx.stub.getState(getEmployeeField(index)).then((res) => Employee.fromBuffer(res));
	}

}
