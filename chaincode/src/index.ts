import { Contract } from "fabric-contract-api";
import EmployeesContract from "./EmployeesContract";

export const contracts: Array<typeof Contract> = [EmployeesContract];
export { default as Employee, IEmployee } from "./Employee";
export { EmployeesContract };
