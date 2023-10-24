export const APP_NAME = 'QUANLYQUY_BANGKE';

export const JWT_TOKEN = `${APP_NAME}_JWT_TOKEN`;
export const REFRESH_TOKEN = `${APP_NAME}_REFRESH_TOKEN`;
export const CURRENT_USER = `${APP_NAME}_CURRENT_USER`;
export const ORG_MENU = `${APP_NAME}_ORG_MENU`;
export const MENU = `${APP_NAME}_MENU`;

export const RECEIPT_DELIVERY_MANA_STATUS_CODE = {
    DA_HUY: 'DA_HUY',
    CHO_HOAN_THANH_CHI: 'CHO_HOAN_THANH_CHI',
    CHO_HOAN_THANH_THU: 'CHO_HOAN_THANH_THU',
    HOAN_THANH: 'HOAN_THANH',
};

export const CUSTOMER_TYPE_LIST = [
    { code: 1, name: 'Có CIF hoặc REF' },
    { code: 0, name: 'Chưa có CIF và REF' }
];

export const CUSTOMER_DOC_TYPE_LIST = [
    { id: 'CIF', code: 'CIF', name: 'CIF' },
    { id: 'GTTT', code: 'GTTT', name: 'GTTT' },
    { id: 'REF', code: 'REF', name: 'REF' }
];

export const CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE = {
    DA_HUY: 'DA_HUY',
    DA_XOA: 'DA_XOA',
    CHO_XAC_NHAN: 'CHO_XAC_NHAN',
    DA_XAC_NHAN: 'DA_XAC_NHAN'
};

export const CREDIT_DEBIT_TRANS_USER_ROLE = [
    { id: '', name: 'Tất cả' },
    { id: 'GDV', name: 'Giao dịch viên' },
    { id: 'QP', name: 'Quỹ phụ' },
    { id: 'QC', name: 'Quỹ chính' }
];

export const CREDIT_DEBIT_TRANS_FCC_STATUS_LIST = [
    { id: '', code: '', name: 'Tất cả' },
    { id: 'WTS', code: 'WTS', name: 'Chưa hoàn thành' },
    { id: 'COM', code: 'COM', name: 'Hoàn thành' }
];

export const CREDIT_DEBIT_TRANS_TYPE_CODE = {
    CAN_TRU: 'CAN_TRU',
    THU: 'THU',
    CHI: 'CHI',
    BBGN_THU_ATM: 'BBGN_THU_ATM',
    BBGN_CHI_TCTD: 'BBGN_CHI_TCTD',
    BBGN_THU_TCTD: 'BBGN_THU_TCTD',
    BBGN_CHI_NHNN: 'BBGN_CHI_NHNN',
    BBGN_THU_NHNN: 'BBGN_THU_NHNN',
    BBGN_CHI_ATM: 'BBGN_CHI_ATM',
    BBGN_THU_DIEU_TIEP_QUY: 'BBGN_THU_DTQ',
    BBGN_CHI_DIEU_TIEP_QUY: 'BBGN_CHI_DTQ'
};

export const MAT_PAGESIZE_OPTIONS = [5, 10, 25, 50, 100];

export const STATUS = [
    { id: '', name: 'Tất cả' },
    { id: 'COM', name: 'Hoàn thành' },
    { id: 'PEN', name: 'Chưa hoàn thành' },
    { id: 'DEL', name: 'Đã hủy' }
];

export const SEALBAG_STATUS_CODE = {
    CHO_NIEM_PHONG: 'CHO_NIEM_PHONG',
    DA_NIEM_PHONG: 'DA_NIEM_PHONG'
};

export const SEALBAG_TYPE_CODE = {
    BNP_LANH: 'LANH',
    BNP_RACH: 'RACH'
};

export const STATUS_MANAGE_ALLOCATION = [
    { id: 'Y', name: 'Đã phân bổ', color: 'badge badge-success' },
    { id: 'N', name: 'Chưa phân bổ', color: 'badge badge-warning'},
];

export const HEAL_TORN_COIN_TYPE = [
    { id: '', name: 'Tất cả' },
    { id: 'HEAL', name: 'Lành' },
    { id: 'TORN', name: 'Rách' },
    { id: 'COIN', name: 'Coin' }
];

export const STATUSDENOMINATION = [
    { id: '', name: 'Tất cả' },
    { id: 'HOAN_THANH', 'name': 'Hoàn thành' },
    { id: 'DA_HUY', 'name': 'Đã hủy' }
];

export const ADVANCE_FUND_TYPE = [
    { id: '', name: 'Tất cả' },
    { id: 'UNG_QUY_TRONG_NGAY', name: 'Ứng quỹ trong ngày' },
    { id: 'HOAN_QUY_TRONG_NGAY', name: 'Hoàn quỹ trong ngày' },
    { id: 'UNG_QUY_DAU_NGAY', name: 'Ứng quỹ đầu ngày' },
    { id: 'HOAN_QUY_CUOI_NGAY', name: 'Hoàn quỹ cuối ngày' }
];

export const ADVANCE_FUND_ROLE = [
    { id: '', name: 'Tất cả' },
    { id: 'QC', name: 'Quỹ chính' },
    { id: 'QP', name: 'Quỹ phụ' }
];

export const STATUSFCC = [
    { id: '', name: 'Tất cả' },
    { id: 'COM', name: 'Hoàn thành' },
    { id: 'IPR', name: 'Chưa hoàn thành' }
];

export const TIEN_GIA_MAU = ['04_KIEM_KE_QUY_GIUA_GIO_DOT_XUAT_DV' , '05_KIEM_KE_QUY_CUOI_NGAY_DVTQ' , '06_KIEM_KE_QUY_BBGN' ,
'07_BB_KIEM_KE_QUY_TAI_SAN_KHAC' , '08_BB_KIEM_KE_QUY_TAI_SAN_KHAC_BBGN' , '09_BB_KIEM_KE_BAN_GIAO_TAI_SAN_DVTQ', '10_BB_KIEM_KE_BAN_GIAO_TAI_SAN_DVKTQ'];

export const HOI_DONG_KIEM_KE = ['07_BB_KIEM_KE_QUY_TAI_SAN_KHAC' , '08_BB_KIEM_KE_QUY_TAI_SAN_KHAC_BBGN', '09_BB_KIEM_KE_BAN_GIAO_TAI_SAN_DVTQ'];

export const APP_DATE_FORMATS = {
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { year: 'numeric', month: 'numeric' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};

export const APP_ROLE = [
    { id: 'GDV', name: 'Giao dịch viên' },
    { id: 'QP', name: 'Quỹ phụ' },
    { id: 'QC', name: 'Quỹ chính' },
    { id: 'OTHER_USER', name: 'User khác' },
    { id: 'ADMIN', name: 'ADMIN' },
];

export const TYPE_HEALTORNCOIN = [
    { id: 'HEAL', name: 'Tiền lành' },
    { id: 'TORN', name: 'Tiền rách' }
];

export const TYPE_ROLE_FUND_LIMIT = [
    { id: 'GDV', name: 'Giao dịch viên' },
    { id: 'QP', name: 'Quỹ phụ' },
    { id: 'TK', name: 'Két thủ kho' }
];

export const TYPE_ROLE_RESERVE_FUND = [
    { id: 'QP', name: 'Quỹ phụ' },
    { id: 'QC', name: 'Quỹ chính' }
];

export const TRANSACTION_TYPE = [
    { id: '', name:'Tất cả'},
    { id: 'BANG_KE', name:'Bảng kê'},
    { id: 'UNG_HOAN_QUY', name:'Ứng hoàn quỹ'},
    { id: 'PHAN_BO_DAU_NGAY', name:'Phân bổ đầu ngày'},
    { id: 'BAO_NIEM_PHONG', name:'Bao niêm phong'},
    { id: 'DOI_MENH_GIA', name:'Đổi mệnh giá'},
    { id: 'XUAT_NHAP_KHO', name:'Xuất nhập kho'},
    { id: 'BIEN_BAN_GIAO_NHAN', name:'Biên bản giao nhận'},
];

export const TYPE_WAREHOUSING_BILL = [
    { id: 'XUAT', name: 'Xuất kho' },
    { id: 'NHAP', name: 'Nhập kho' }
];

export const TYPE_PROTOCOL_RECEIVE = [
    { id: '', name: 'Tất cả' },
    { id: 'TQDN', name: 'Tiếp quỹ đầu ngày' },
    { id: 'TQTN', name: 'Tiếp quỹ trong ngày' },
    { id: 'TTQDN', name: 'Tăng tiếp quỹ đầu ngày' },
    { id: 'DVTN', name: 'Điều vốn trong ngày' },
    { id: 'DVCN', name: 'Điều vốn cuối ngày' },
    { id: 'DVC_DVKD', code: '9008', name: 'Điều vốn giữa Cụm với ĐVKD đặt Cụm' },
    { id: 'TVC_DVKD', code: '9007', name: 'Tiếp vốn giữa Cụm với ĐVKD đặt Cụm' },
    { id: 'DVCNC_DVKD', code: '9008', name: 'Điều vốn cuối ngày giữa Cụm với ĐVKD đặt Cụm' },
    { id: 'TVDNC_DVKD', code: '9007', name: 'Tiếp vốn đầu ngày giữa Cụm với ĐVKD đặt Cụm' }
];

export const FUND_TYPE = [
    { id: 'KKQGG',  name: 'Kiểm kê quỹ giữa giờ' },
    { id: 'KKQTHQ',  name: 'Kiểm kê quỹ trước hoàn quỹ' },
    { id: 'KKQSHQ',  name: 'Kiểm kê quỹ sau hoàn quỹ' },
];

export const STATUS_PROTOCOL_RECEIVE = [
    { id: '', name: 'Tất cả' },
    { id: 'COM', name: 'Hoàn thành' },
    { id: 'PEN', name: 'Chưa hoàn thành' }
];

export const ROLE = {
    GDV: 'GDV',
    QC: 'QC',
    QP: 'QP',
    KSV: 'KSV'
};

export const STATUS_COMFIRM_PROTOCOL_RECEIVE = [
    { id: '', name: 'Tất cả' },
    { id: 'PEN', name: 'Chờ xác nhận số tiền thu' },
    { id: 'COM', name: 'Đã xác nhận số tiền thu' }
];

export const STATUS_BRANCH_ALLOW_FUND = [
    { id: '', name: 'Tất cả' },
    { id: '0', name: 'Đơn vị không được tồn quỹ' },
    { id: '1', name: 'Đơn vị được tồn quỹ' }
];

export const STATUS_ACTIVE_FLAG = [
    { id: '', name: 'Tất cả' },
    { id: '0', name: 'Không hoạt động' },
    { id: '1', name: 'Hoạt động' }
];

export const FUNCTION_ID_LIST = [
    { id: '', code: '', name: 'Tất cả' },
    { id: '9007', code: '9007', name: '9007' },
    { id: '9008', code: '9008', name: '9008' },
    { id: 'SCTT', code: 'SCTT', name: 'SCTT' },
    { id: 'BCFT', code: 'BCFT', name: 'BCFT' },
];

export const TYPE_TRANSACTION = [
    { id: '', name: 'Tất cả' },
    { id: 'UNG', name: 'Ứng quỹ trong ngày' },
    { id: 'HOAN', name: 'Hoàn quỹ trong ngày' },
    { id: 'UQDN', name: 'Ứng quỹ đầu ngày' },
    { id: 'PBDN', name: 'Phân bổ đầu ngày' },
    { id: 'HQCN', name: 'Hoàn quỹ cuối ngày' },
];

export const LOCK_DAY_STATUS = [
    { id: 'MO_SO', name: 'Mở sổ' , color:'badge badge-success'},
    { id: 'KHOA_SO', name: 'Khóa sổ' , color:'badge badge-danger'},
    { id: 'CHO_DUYET_MO_SO', name: 'Chờ duyệt mở sổ' , color:'badge badge-warning'},
];

export const STATUS_SYSTEM = [
    { id: 0, code: false, 'name': 'Tạm ngừng', color: 'badge badge-warning'},
    { id: 1, code: true, 'name': 'Hoạt động', color: 'badge badge-success'},
];

export const HEAD = [
    {
      'branch_code': '000',
      'branch_name': 'Hội sở',
    }
];

export const SEAL_BAG_STATUS = [
    { code: 'COM', name:'Đã niêm phong', color:'badge badge-success'},
    { code: 'PEN', name:'Chờ niêm phong',  color: 'badge badge-primary'}
];

export const WAREHOUSE_STATUS = [
    { code: 'PEN', name:'Chờ duyệt', color:'badge badge-pending'},
    { code: 'COM', name:'Đã duyệt', color:'badge badge-success'},
    { code: 'PEN_REVERT', name:'Chờ duyệt Revert',  color: 'badge badge-primary'},
    { code: 'COM_REVERT', name:'Đã duyệt Revert',  color: 'badge badge-primary'},
    { code: 'REFUSE', name:'Từ chối',  color: 'badge badge-primary'},
    { code: 'DEL', name:'Hủy bỏ',  color: 'badge badge-primary'},
];


export const ADVANCE_FUND_STATUS = [
    { code: '', name:'Tất cả', color: ''},
    { code: 'KHOI_TAO', name:'Khởi tạo', color:'badge rounded-pill badge-info'},
    { code: 'DA_DUYET', name:'Đã duyệt', color:'badge rounded-pill badge-success'},
    { code: 'CHO_DUYET', name:'Chờ duyệt', color:'badge rounded-pill badge-primary'},
    { code: 'DA_HUY', name:'Đã hủy', color:'badge rounded-pill badge-danger'},
];
export const ADVANCE_FUND_MANAGER = [
    { code: 'CHUA_PHAN_BO', name:'Chưa phân bổ', color:'badge rounded-pill badge-info'},
    { code: 'DA_PHAN_BO', name:'Đã phân bổ', color:'badge rounded-pill badge-success'},
    { code: 'DA_HUY', name:'Đã hủy', color:'badge rounded-pill badge-danger'},
];
export const ADVANCE_FUND_DAY_TYPE = [
    { type: '', name:'Tất cả', color:'badge rounded-pill badge-info'},
    { type: 'UNG_QUY_TRONG_NGAY', name:'Ứng quỹ trong ngày', color:'badge rounded-pill badge-info'},
    { type: 'HOAN_QUY_TRONG_NGAY', name:'Hoàn quỹ trong ngày', color:'badge rounded-pill badge-success'},
];

export const NOTIFICATION = 'Thông báo';
export const VALIDATA_VALUE = 'Vui lòng nhập đầy đủ/chính xác thông tin';
export const NOTIFICATION_SAVE = 'Bạn có chắc muốn lưu thông tin này không ?';
export const NOTIFICATION_UPDATE = 'Bạn có chắc muốn cập nhập thông tin này không ?'
export const NOTIFICATION_DELETE = 'Bạn có chắc muốn xóa thông tin này không ?'
export const NOTIFICATION_CANCEL = 'Bạn có chắc muốn hủy thông tin này không ?'
export const EDIT = 'edit';
export const ADD = 'add';
export const DETAIL = 'detail';
export const COMPLETE = 'complete';
export const STATUS_UPDATE_COMPLE = 'Bạn đã cập nhật thành công';
export const STATUS_UPDATE_CANCE = 'Bạn đã cập nhật không thành công';
export const KEY_DATA_NOT_VALUE = 'Dữ liệu yêu cầu không được tìm thấy';
export const STATUS_SAVE_COMPLE = 'Bạn đã lưu thành công'