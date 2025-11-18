// src/config/appRolesStructure.map.js
export const appMap = {
    overall: {
        superAdmin: { id: "ceo", label: "CEO" },
        admin: { id: "branchManager", label: "Branch Manager" }
    },

    divisions: {
        followUp: {
            id: "followUp",
            label: "Follow Up",
            // optional division-level scopes (fallbacks for departments if not set)
            viewScope: "division",    // 'division' by default for division root
            actionScope: "division",
            divisionHead: { id: "followUpMA", label: "Follow Up Manager" },
            departments: {
                supplierJoiningRequests: {
                    id: "supplierJoiningRequests",
                    label: "Supplier Joining Requests",
                    departmentHead: { id: "supplierJoinMA", label: "Supplier Joining Manager" },
                    employees: [{ id: "supplierJoinEM", label: "Supplier Join Employee" }],

                    // access control using scopes + optional extras
                    viewScope: "department",      // only dept head & dept employees and allowed extras can view
                    actionScope: "department",    // typically employees act
                    extraViewRoles: [],           // explicit allow-list (role ids)
                    extraActionRoles: [],         // explicit action allow-list
                    allowEmployeeReports: false
                },

                supplierOrderTracking: {
                    id: "supplierOrderTracking",
                    label: "Supplier Order Tracking",
                    departmentHead: { id: "supplierOrderTrackingMA", label: "Supplier Order Tracking Manager" },
                    employees: [{ id: "supplierOrderTrackingEM", label: "Supplier Order Tracking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                purchase: {
                    id: "purchase",
                    label: "Purchase",
                    departmentHead: { id: "purchaseMA", label: "Purchase Manager" },
                    employees: [{ id: "purchaseEM", label: "Purchase Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        customerService: {
            id: "customerService",
            label: "Customer Service",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "customerServiceMA", label: "Customer Service Manager" },
            departments: {
                clientJoiningRequests: {
                    id: "clientJoiningRequests",
                    label: "Client Joining Requests",
                    departmentHead: { id: "clientJoinMA", label: "Client Join Manager" },
                    employees: [{ id: "clientJoinEM", label: "Client Join Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                clientOrderTracking: {
                    id: "clientOrderTracking",
                    label: "Client Order Tracking",
                    departmentHead: { id: "clientOrderTrackingMA", label: "Client Order Tracking Manager" },
                    employees: [{ id: "clientOrderTrackingEM", label: "Client Order Tracking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        receivingInspection: {
            id: "receivingInspection",
            label: "Receiving & Inspection",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "receivingInspectionMA", label: "Receiving & Inspection Manager" },
            departments: {
                ordersReceiving: {
                    id: "ordersReceiving",
                    label: "Orders Receiving",
                    departmentHead: { id: "ordersReceivingMA", label: "Orders Receiving Manager" },
                    employees: [{ id: "ordersReceivingEM", label: "Orders Receiving Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                missingReturns: {
                    id: "missingReturns",
                    label: "Missing & Returns",
                    departmentHead: { id: "missingReturnsMA", label: "Missing & Returns Manager" },
                    employees: [{ id: "missingReturnsEM", label: "Missing & Returns Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        shipping: {
            id: "shipping",
            label: "Shipping",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "shippingMA", label: "Shipping Manager" },
            departments: {
                orderShipping: {
                    id: "orderShipping",
                    label: "Order Shipping",
                    departmentHead: { id: "orderShippingMA", label: "Order Shipping Manager" },
                    employees: [{ id: "orderShippingEM", label: "Order Shipping Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                orderPicking: {
                    id: "orderPicking",
                    label: "Order Picking",
                    departmentHead: { id: "orderPickingMA", label: "Order Picking Manager" },
                    employees: [{ id: "orderPickingEM", label: "Order Picking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        inventory: {
            id: "inventory",
            label: "Inventory",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "inventoryMA", label: "Inventory Manager" },
            departments: {
                processing: {
                    id: "processing",
                    label: "Processing",
                    departmentHead: { id: "processingMA", label: "Processing Manager" },
                    employees: [{ id: "processingEM", label: "Processing Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                returns: {
                    id: "returns",
                    label: "Returns",
                    departmentHead: { id: "returnsMA", label: "Returns Manager" },
                    employees: [{ id: "returnsEM", label: "Returns Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        }
    }
};
