import { List } from "linq-typescript";
import * as internal from "stream";

export class NotReserve {
    branchId: string;
    ccyLimitAmount: List<CcyLimitAmount>
}
export class CcyLimitAmount{
    ccy:string;
    limitAmount: internal;
    activeFlag:boolean;
}