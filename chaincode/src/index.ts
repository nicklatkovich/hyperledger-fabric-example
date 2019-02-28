import { Contract } from "fabric-contract-api";
import EmployeesContract from "./EmployeesContract";

export const contracts: Array<typeof Contract> = [EmployeesContract];
export { default as Employee } from "./Employee";
export { EmployeesContract };
