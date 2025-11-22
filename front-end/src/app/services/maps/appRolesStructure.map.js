// src/config/appRolesStructure.map.js
export const appMap = {
    overall: {
        superAdmin: { id: "ceo", label: "CEO" },
        admin: { id: "branchManager", label: "Branch Manager" }
    },

    divisions: {
        followUp: {
            id: "FollowUp",
            label: "Follow Up",
            // optional division-level scopes (fallbacks for departments if not set)
            viewScope: "division",    // 'division' by default for division root
            actionScope: "division",
            divisionHead: { id: "FollowUpMA", label: "Follow Up Manager" },
            departments: {
                supplierJoiningRequests: {
                    id: "SupplierJoiningRequests",
                    label: "Supplier Joining Requests",
                    departmentHead: { id: "SupplierJoinMA", label: "Supplier Joining Manager" },
                    employees: [{ id: "SupplierJoinEM", label: "Supplier Join Employee" }],

                    // access control using scopes + optional extras
                    viewScope: "department",      // only dept head & dept employees and allowed extras can view
                    actionScope: "department",    // typically employees act
                    extraViewRoles: [],           // explicit allow-list (role ids)
                    extraActionRoles: [],         // explicit action allow-list
                    allowEmployeeReports: false
                },

                supplierOrderTracking: {
                    id: "SupplierOrderTracking",
                    label: "Supplier Order Tracking",
                    departmentHead: { id: "SupplierOrderTrackingMA", label: "Supplier Order Tracking Manager" },
                    employees: [{ id: "SupplierOrderTrackingEM", label: "Supplier Order Tracking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                purchase: {
                    id: "Purchase",
                    label: "Purchase",
                    departmentHead: { id: "PurchaseMA", label: "Purchase Manager" },
                    employees: [{ id: "PurchaseEM", label: "Purchase Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        customerService: {
            id: "CustomerService",
            label: "Customer Service",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "CustomerServiceMA", label: "Customer Service Manager" },
            departments: {
                clientJoiningRequests: {
                    id: "ClientJoiningRequests",
                    label: "Client Joining Requests",
                    departmentHead: { id: "ClientJoinMA", label: "Client Join Manager" },
                    employees: [{ id: "ClientJoinEM", label: "Client Join Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                clientOrderTracking: {
                    id: "ClientOrderTracking",
                    label: "Client Order Tracking",
                    departmentHead: { id: "ClientOrderTrackingMA", label: "Client Order Tracking Manager" },
                    employees: [{ id: "ClientOrderTrackingEM", label: "Client Order Tracking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        receivingInspection: {
            id: "ReceivingInspection",
            label: "Receiving & Inspection",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "ReceivingInspectionMA", label: "Receiving & Inspection Manager" },
            departments: {
                ordersReceiving: {
                    id: "OrdersReceiving",
                    label: "Orders Receiving",
                    departmentHead: { id: "OrdersReceivingMA", label: "Orders Receiving Manager" },
                    employees: [{ id: "OrdersReceivingEM", label: "Orders Receiving Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                missingReturns: {
                    id: "MissingReturns",
                    label: "Missing & Returns",
                    departmentHead: { id: "MissingReturnsMA", label: "Missing & Returns Manager" },
                    employees: [{ id: "MissingReturnsEM", label: "Missing & Returns Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        shipping: {
            id: "Shipping",
            label: "Shipping",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "ShippingMA", label: "Shipping Manager" },
            departments: {
                orderShipping: {
                    id: "OrderShipping",
                    label: "Order Shipping",
                    departmentHead: { id: "OrderShippingMA", label: "Order Shipping Manager" },
                    employees: [{ id: "OrderShippingEM", label: "Order Shipping Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                orderPicking: {
                    id: "OrderPicking",
                    label: "Order Picking",
                    departmentHead: { id: "OrderPickingMA", label: "Order Picking Manager" },
                    employees: [{ id: "OrderPickingEM", label: "Order Picking Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                }
            }
        },

        inventory: {
            id: "Inventory",
            label: "Inventory",
            viewScope: "division",
            actionScope: "division",
            divisionHead: { id: "InventoryMA", label: "Inventory Manager" },
            departments: {
                processing: {
                    id: "Processing",
                    label: "Processing",
                    departmentHead: { id: "ProcessingMA", label: "Processing Manager" },
                    employees: [{ id: "ProcessingEM", label: "Processing Employee" }],

                    viewScope: "department",
                    actionScope: "department",
                    extraViewRoles: [],
                    extraActionRoles: [],
                    allowEmployeeReports: false
                },

                returns: {
                    id: "Returns",
                    label: "Returns",
                    departmentHead: { id: "ReturnsMA", label: "Returns Manager" },
                    employees: [{ id: "ReturnsEM", label: "Returns Employee" }],

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
