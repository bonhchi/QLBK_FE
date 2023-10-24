export interface User {
    id: number;
    username: string;
    fullname: string;
    email: string;
    role: any;
    roleName: string[];
    positions: {
        branch: {
            id: string,
            code: string,
            name: string,
            address: string,
            display_name: string
        };
        department: {
            id: string,
            code: string,
            level: number,
            parent_id: string,
            name: string,
            description: string,
            short_name: string
        }
    };    
    positions_fcc:{
        branch_code: string,
        branch_name: string
    }
}