export interface Menu {
    id?: string;
    link?: string;
    title?: string;
    icon?: string;
    type?: string;
    badgeType?: string;
    badgeValue?: string;
    active?: boolean;
    sub_title?: string;
    children?: Menu[];
}