export type ErpCustomerSampleInput = {
  erpCustomerNumber: string;
  customerName: string;
  gstNo: string;
  panNo: string;
  state: string;
  email: string | null;
  phone: string;
  address: string;
  others: string;
  erpStatus: string;
};

export const ERP_CUSTOMER_SAMPLE_ROWS: ErpCustomerSampleInput[] = [
  {
    erpCustomerNumber: "CUST-001",
    customerName: "Dr. Batra's Care Pvt. Ltd.",
    gstNo: "27AAACD2122H1Z1",
    panNo: "AAACD2122H",
    state: "Maharashtra",
    email: "accounts@drbatras.com",
    phone: "912233789100",
    address:
      "2nd Floor, H.No. 2, Dr. Batra's House, Plot No. 3, Sector 1, Vashi, Navi Mumbai - 400 703, Maharashtra, India",
    others: "27",
    erpStatus: "Not Available",
  },
  {
    erpCustomerNumber: "CUST-002",
    customerName: "Dr. Batra's Multi-speciality Dental Clinic",
    gstNo: "27AAACD2122H1Z1",
    panNo: "AAACD2122H",
    state: "Maharashtra",
    email: null,
    phone: "912233789100",
    address:
      "Unit No. 101, 1st Floor, Dr. Batra's House, Plot No. 3, Sector 1, Vashi, Navi Mumbai - 400 703, Maharashtra, India",
    others: "27",
    erpStatus: "Not Available",
  },
  {
    erpCustomerNumber: "CUST-003",
    customerName: "IPCA LIMITED",
    gstNo: "27AAACI1416B1Z3",
    panNo: "AAACI1416B",
    state: "Maharashtra",
    email: "accounts@ipca.com",
    phone: "912266474747",
    address: "142 AB, Kandivli Industrial Estate, Kandivli (West), Mumbai - 400 067, Maharashtra, India",
    others: "27",
    erpStatus: "Not Available",
  },
];

export const ERP_CUSTOMER_IMPORT_TEMPLATE = `Customer Name,GST No.,PAN No.,State,Email,Phone,Address,Other,Status
Dr. Batra's Care Pvt. Ltd.,27AAACD2122H1Z1,AAACD2122H,Maharashtra,accounts@drbatras.com,912233789100,"2nd Floor, H.No. 2, Dr. Batra's House, Plot No. 3, Sector 1, Vashi, Navi Mumbai - 400 703, Maharashtra, India",27,Not Available
Dr. Batra's Multi-speciality Dental Clinic,27AAACD2122H1Z1,AAACD2122H,Maharashtra,,912233789100,"Unit No. 101, 1st Floor, Dr. Batra's House, Plot No. 3, Sector 1, Vashi, Navi Mumbai - 400 703, Maharashtra, India",27,Not Available
IPCA LIMITED,27AAACI1416B1Z3,AAACI1416B,Maharashtra,accounts@ipca.com,912266474747,"142 AB, Kandivli Industrial Estate, Kandivli (West), Mumbai - 400 067, Maharashtra, India",27,Not Available`;
