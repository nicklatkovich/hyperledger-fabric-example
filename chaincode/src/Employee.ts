import { ok } from "assert";

export interface IEmployee {
	age: number;
	firstName: string;
	secondName: string;
}

export default class Employee implements IEmployee {

	private _age: number;
	public get age(): number { return this._age; }
	public set age(newAge: number) {
		ok(Number.isFinite(newAge), 'age is not a finite number');
		ok(Number.isSafeInteger(newAge), 'age is not a integer');
		ok(newAge >= 0, 'age is negative');
		ok(newAge < 256, 'age is greater or equals to 256');
		this._age = newAge;
	}

	private _firstName: string;
	public get firstName(): string { return this._firstName; }
	public set firstName(newFirstName: string) {
		ok(Buffer.from(newFirstName, 'utf-8').length < 32, 'first name too long');
		this._firstName = newFirstName;
	}

	private _secondName: string;
	public get secondName(): string { return this._secondName; }
	public set secondName(newSecondName: string) {
		ok(Buffer.from(newSecondName, 'utf-8').length < 32, 'second name too long');
		this._secondName = newSecondName;
	}

	constructor(firstName: string, secondName: string, age: number) {
		this.firstName = firstName;
		this.secondName = secondName;
		this.age = age;
	}

	public static fromBuffer(buffer: Buffer): Employee {
		console.log(buffer.toString('hex'));
		let offset = 0;
		const age = Number.parseInt(buffer.slice(offset, offset + 1).toString('hex'), 16);
		offset += 1;
		const firstNameLength = Number.parseInt(buffer.slice(offset, offset + 4).toString('hex'), 16);
		offset += 4;
		const firstName = buffer.slice(offset, offset + firstNameLength).toString('utf-8');
		offset += firstNameLength;
		const secondNameLength = Number.parseInt(
			buffer.slice(offset, offset + 4).toString('hex'),
			16,
		);
		offset += 4;
		const secondName = buffer.slice(offset, offset + secondNameLength).toString('utf-8');
		return new Employee(firstName, secondName, age);
	}

	public static fromJSON(data: Buffer | string): Employee {
		if (Buffer.isBuffer(data)) data = data.toString();
		const { firstName, secondName, age } = JSON.parse(data) as IEmployee;
		return new Employee(firstName, secondName, age);
	}

	public toBuffer(): Buffer {
		const firstNameBytecode = Buffer.from(this.firstName, 'utf-8');
		const secondNameBytecode = Buffer.from(this.secondName, 'utf-8');
		return Buffer.from([
			this.age.toString(16).padStart(2, '0'),
			firstNameBytecode.length.toString(16).padStart(8, '0'),
			firstNameBytecode.toString('hex'),
			secondNameBytecode.length.toString(16).padStart(8, '0'),
			secondNameBytecode.toString('hex'),
		].join(''), 'hex');
	}

	public toJSON(): IEmployee {
		return { age: this.age, firstName: this.firstName, secondName: this.secondName };
	}

	public inspect(): string {
		return `Employee ${this.firstName} ${this.secondName} (${this.age} years old)`;
	}

}
