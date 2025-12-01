import DataTable from '@/components/ui/common/dataTable/dataTable';

const columns = [
    { key: 'code', title: 'كود المورد', span: 2 },
    { key: 'avatar', title: 'الكيان' },
    { key: 'badge', title: 'الحالة' },
    { key: 'coloredBadge', title: 'نوع' },
    { key: 'date', title: 'تاريخ الانضمام', span: 2 },
    { key: 'actions', title: 'الإجراءات' },
    { key: 'details', title: 'تفاصيل' }
];

const rows = [
    { id: '1', name: 'أحمد علي', avatar: '/avatars/a1.jpg', badge: 'نشط', status: 'مفعل', statusTone: 'success', code: 44607, date: '25 نوفمبر 2025', notes: 'مورد أساسي' },
    { id: '2', name: 'محمد سمير', avatar: '/avatars/a2.jpg', badge: 'قيد الانتظار', status: 'قيد الانتظار', statusTone: 'warning', code: 83513, date: '25 نوفمبر 2025', notes: 'جاري التوثيق' },
    // ...more rows
];

export default function DataTableRunner() {
    const handleSelection = (selectedIds) => {
        console.log('selected:', selectedIds);
    };
    const handleOrder = (newRows) => {
        console.log('new order:', newRows.map(r => r.id));
    };

    return (
        <div className="p-6">
            <DataTable columns={columns} data={rows} onSelectionChange={handleSelection} onOrderChange={handleOrder} />
        </div>
    );
}
