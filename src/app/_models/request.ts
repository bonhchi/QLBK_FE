export class SearchRepAdjInv{
    from_date?: string;
    to_date?: string;
    branch_code?: string;
    teller_user?: string;
    type_code?: string;
    invoice_num?: string;
    invoice_type?: string;
    lo_code?:string;
    page_num?: number;
    page_size?: number;
}

export class SaveInvReplaceDetail{
    id?:number;
    ibooking_id?:number;
    service_id?:string;
    service_name?:string;
    unit?:string;
    amount?:number;
    ccy?:string;
    txn_fxamt?:number;
    txn_amt?:number;
    fxrate?:number;
    vat_value?:number;
    vat_fxamt?:number;
    vat_amt?:number;
    total_fxamt?:number;
    total_amt?:number;
    price?:number;
}

export class SaveInvReplace{
    ibooking_id?:number;
    typecode?:string;
    trn_ref_no?:string;
    cust_no?:string;
    cust_account?:string;
    cust_card?:string;
    cust_vat?:string;
    cust_name?:string;
    cust_address?:string;
    description?:string;
    created_user?:string;
    created_date?:string;
    created_ip?:string;
    is_deleted?:boolean;
    invoice_type?:string;
    parent_id?:number;
    txn_no?:string;
    txn_date?:string;
    details?:Array<SaveInvReplaceDetail>;
}


export class SearchRepAdjInvLink{
    symbol?: string;
    symbol_tobe?: string;
    invoice_num?: string;
    invoice_num_tobe?: number;
    txn_date?: string;
    txn_date_tobe?: string;
    page_num?: number;
    page_size?: number;
}

export class SaveUpdateInvLink{
    parent_id?: number; 
    invoice_id?: number;
    service_name?: string;
    invoice_num?: string;
    symbol?: string;
    invoice_type?: string;
    txn_date?: string;
}

