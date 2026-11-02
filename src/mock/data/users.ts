export interface MockUser {
  userId: string;
  name: string;
  email: string;
  oper_kod: string;
  superadmin: boolean;
  avatar?: string;
  role: string;
}

export const INITIAL_USERS: MockUser[] = [
  {
    userId: "1",
    name: "James Mitchell",
    email: "admin@partsflow.demo",
    oper_kod: "OP1,OP2,OP3",
    superadmin: true,
    role: "Administrator / Sales Director",
  },
  {
    userId: "2",
    name: "Michael Anderson",
    email: "m.anderson@partsflow.demo",
    oper_kod: "OP1",
    superadmin: false,
    role: "Sales Representative (South)",
  },
  {
    userId: "3",
    name: "Emily Johnson",
    email: "e.johnson@partsflow.demo",
    oper_kod: "OP2",
    superadmin: false,
    role: "Sales Representative (Central)",
  },
  {
    userId: "4",
    name: "David Thompson",
    email: "d.thompson@partsflow.demo",
    oper_kod: "OP3",
    superadmin: false,
    role: "Key Account Manager (North)",
  },
  {
    userId: "5",
    name: "Sarah Williams",
    email: "s.williams@partsflow.demo",
    oper_kod: "OP1,OP2",
    superadmin: false,
    role: "B2B Customer Service Specialist",
  },
];
