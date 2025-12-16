'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator } from "react-icons/md";
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

import { Checkbox } from '@/components/ui/checkbox';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { useModal } from '@/hooks/useModal';
import { registerCallback } from '@/lib/modalCallbacks';



/* ---------- SortableRow ---------- */
function SortableRow({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto'
    };
    return (
        <div ref={setNodeRef} style={style} className={`${isDragging ? 'bg-gray-100 animate-pulse duration-400' : ''}`}>
            <div className="flex items-stretch">
                <div className="px-2 flex items-center">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-2 rounded hover:bg-gray-100"
                        aria-label="drag-handle"
                    >
                        <MdDragIndicator size={18} />
                    </button>
                </div>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}

/**
 * DataTable props:
 * - columns: [{ key, title, span? (1..12), render?(row) }]
 * - data: array of rows [{ id, ... }]
 * - pageSizeOptions: [5,10,20]
 * - initialPageSize
 * - totalRows (optional) -> for server pagination show total count
 * - onPageChange(pageIndex, pageSize)
 * - onSelectionChange(selectedIds)
 * - onOrderChange(newRows)  // full rows array after reordering (local)
 */
export default function DataTable({
    columns = [],
    data = [],
    pageSizeOptions = [5, 10, 20],
    initialPageSize = 5,
    totalRows = null,
    onPageChange,
    onSelectionChange,
    onOrderChange,
    onDelete = null,
    // Optional: a dialog React element (e.g. <SupplierDialog />) that will be
    // cloned and opened in `update` mode when the row 'تعديل' action is clicked.
    rowDialog = null,
    // detailsComponentMap: { [typeName]: Component }
    detailsComponentMap = {},
    // key on row that identifies type, default 'type'
    rowTypeKey = 'type',
    visibleColumns = null
}) {
    const { openModal, closeModal } = useModal();
    const [rows, setRows] = useState(() => data);
    const [selected, setSelected] = useState(new Set());
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);

    useEffect(() => setRows(data), [data]);
    useEffect(() => { onSelectionChange && onSelectionChange(Array.from(selected)); }, [selected]);
    useEffect(() => { onOrderChange && onOrderChange(rows); }, [rows]);

    // Pagination values
    const total = totalRows ?? rows.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    useEffect(() => { if (pageIndex >= pageCount) setPageIndex(pageCount - 1); }, [pageCount]);

    // Dnd sensors
    const sensors = useSensors(useSensor(PointerSensor));

    // derived: rows to display on this page (client-side)
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const pageRows = rows.slice(start, end);

    const allSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id));

    // Derive which columns to render based on `visibleColumns` (if provided).
    const visibleSet = new Set(Array.isArray(visibleColumns) && visibleColumns.length > 0 ? visibleColumns : columns.map(c => c.key));
    const renderedColumns = (Array.isArray(visibleColumns) && visibleColumns.length > 0) ? columns.filter(c => visibleSet.has(c.key)) : columns;

    function toggleSelectAll() {
        setSelected(prev => {
            const next = new Set(prev);
            if (allSelected) {
                pageRows.forEach(r => next.delete(r.id));
            } else {
                pageRows.forEach(r => next.add(r.id));
            }
            return next;
        });
    }

    function toggleRow(id) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over) return;
        if (String(active.id) === String(over.id)) return;

        // indices in rows array
        const oldIndex = rows.findIndex(r => String(r.id) === String(active.id));
        const newIndex = rows.findIndex(r => String(r.id) === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return;

        const newRows = arrayMove(rows, oldIndex, newIndex);
        setRows(newRows);
    }

    // Helper to compute Tailwind width classes for specific columns.
    function getColClass(col) {
        const defaultFixed = 'w-[155px] min-w-[155px] max-w-[155px]';

        function normalizeWidth(w) {
            if (w == null) return null;
            if (typeof w === 'number') return `${w}px`;
            const s = String(w).trim();
            if (/^\d+$/.test(s)) return `${s}px`; // numeric string -> px
            return s; // assume user passed '120px' or '20%'
        }

        if (col && col.width !== undefined && col.width !== null) {
            const w = normalizeWidth(col.width);
            if (w) return `w-[${w}] min-w-[${w}] max-w-[${w}]`;
        }

        if (col && col.title && String(col.title).trim() === 'اسم الكيان') {
            return defaultFixed;
        }

        return 'flex-1';
    }

    function getColStyle(col) {
        function normalizeWidth(w) {
            if (w == null) return null;
            if (typeof w === 'number') return `${w}px`;
            const s = String(w).trim();
            if (/^\d+$/.test(s)) return `${s}px`;
            return s;
        }

        if (col && col.width !== undefined && col.width !== null) {
            const w = normalizeWidth(col.width);
            if (w) return { width: w, minWidth: w, maxWidth: w };
        }

        if (col && col.title && String(col.title).trim() === 'اسم الكيان') {
            const w = '155px';
            return { width: w, minWidth: w, maxWidth: w };
        }
        if (col && col.title && String(col.title).trim() === 'الفرع الرئيسى') {
            const w = '180px';
            return { width: w, minWidth: w, maxWidth: w };
        }

        return undefined;
    }

    function cellClass(key, widthCls) {
        if (key === 'checkbox') {
            return `relative flex items-center justify-center w-6`;
        }
        // If widthCls is a fixed width (not 'flex-1'), make the cell non-flexing
        const fixed = widthCls && widthCls !== 'flex-1';
        const base = `relative text-sm text-center ${fixed ? 'flex-none' : 'flex'} items-center justify-center ${widthCls ?? ''}`;
        if (key === 'code') return `${base} px-2 py-1 text-sm`; // compact
        if (key === 'category' || key === 'status') return `${base} px-2 py-2 text-xs`; // compact badge/category/status
        if (key === 'date') return `${base} px-2 py-1 text-sm`; // compact
        if (key === 'avatar') return `${base} px-2 py-1 gap-3 justify-center`; // center avatar
        if (key === 'actions') return `${base} px-2 py-1 justify-center`; // center actions
        return `${base} px-3 py-2`;
    }

    // pagination controls
    const gotoFirst = () => setPageIndex(0);
    const gotoPrev = () => setPageIndex(p => Math.max(0, p - 1));
    const gotoNext = () => setPageIndex(p => Math.min(pageCount - 1, p + 1));
    const gotoLast = () => setPageIndex(pageCount - 1);
    useEffect(() => { onPageChange && onPageChange(pageIndex, pageSize); }, [pageIndex, pageSize]);
    const [expandedId, setExpandedId] = useState(null);
    // State for row-level dialog (edit/update)
    const [editRow, setEditRow] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    return (
        <div className="w-full">
            {/* Top bar: selection count (select-all moved to table header) */}
            {/* Table wrapper: single rounded border containing header + rows */}
            <div className="rounded-md border overflow-hidden">
                {/* Header row (as a normal row) */}
                <div className="bg-gray-50">
                    <div className="flex items-center gap-0 px-2 py-1 mr-4">
                        {/* placeholder above drag-handle - mirror row drag-handle width */}
                        <div className="px-0 flex items-center">
                            <div className="px-2 flex items-center">
                                <button className="p-2 opacity-0" aria-hidden="true" aria-label="drag-handle-placeholder" />
                            </div>
                        </div>

                        {/* checkbox moved outside the grid so it doesn't consume span */}
                        <div className={cellClass('checkbox')}>
                            <div className="flex justify-center items-center w-full">
                                <div className="text-xs flex items-center gap-2 -mr-9">
                                    <div className="flex items-center gap-1">
                                        <span className=''>{Array.from(selected).length}</span>
                                        <span> إختيار</span>
                                    </div>
                                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="select-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center w-full">
                            {renderedColumns.map((col, idx) => {
                                if (col.key === 'checkbox') return null; // skipped - rendered outside
                                const title = col.title ?? '';
                                const widthCls = getColClass(col);

                                const style = getColStyle(col);
                                return (
                                    <div key={col.key} className={cellClass(col.key, widthCls)} style={style}>
                                        <div className="text-xs font-medium text-center w-full">{title}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Rows list */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pageRows.map(r => String(r.id))} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0">
                            {pageRows.map((row) => {
                                const isExpanded = String(expandedId) === String(row.id);
                                return (
                                    <SortableRow key={row.id} id={String(row.id)} isExpanded={isExpanded}>
                                        {/* Accordion: trigger wraps the visible row */}
                                        <Accordion type="single" collapsible value={isExpanded ? String(row.id) : null} onValueChange={(val) => setExpandedId(val ? String(val) : null)}>
                                            <AccordionItem className={`${isExpanded ? 'bg-go-bg-l-e  transition-all duration-300' : 'bg-white'}`} value={String(row.id)}>
                                                {/* Row header (chevron-only toggles expansion) */}
                                                    <div className={`flex items-center gap-0 px-2 py-1 ${isExpanded ? 'animate-pulse duration-1100' : ''}`}>
                                                        {/* checkbox moved outside the grid so it doesn't consume span */}
                                                        <div className={cellClass('checkbox')}>
                                                            <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleRow(row.id)} />
                                                        </div>

                                                        {/* We'll render the rest of the columns in the given order */}
                                                        <div className="flex items-center w-full">
                                                            {renderedColumns.map((col, idx) => {
                                                                if (col.key === 'checkbox') return null; // skipped - rendered outside
                                                                const key = col.key;
                                                                const content = col.render ? col.render(row) : (row[key] ?? '');

                                                                // Use centered and compact classes via helper
                                                                const widthCls = getColClass(col);
                                                                const style = getColStyle(col);
                                                                const cls = cellClass(key, widthCls);

                                                                if (key === 'checkbox') {
                                                                    return null;
                                                                }

                                                                if (key === 'code') {
                                                                    return (
                                                                        <div key={key} className={cls} style={style}>
                                                                            {content}
                                                                        </div>
                                                                    );
                                                                }
                                                                if (key === 'avatar') {
                                                                    return (
                                                                        <div key={key} className={cls} style={style}>
                                                                            {content}
                                                                            {idx < renderedColumns.length && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-px bg-gray-200" />}
                                                                        </div>
                                                                    );
                                                                }

                                                                if (key === 'actions') {
                                                                    return (
                                                                        <div key={key} className={cls} style={style}>
                                                                            {content || (
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <Button asChild size="sm" className='rounded-2xl' variant="outline">
                                                                                            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                                                                                إجراءات
                                                                                                <ChevronDown className="h-4 w-4" />
                                                                                            </div>
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent className='text-right' align="end">
                                                                                        {/* <DropdownMenuItem className="w-full justify-end text-right" onClick={() => console.log('view', row.id)}>عرض</DropdownMenuItem> */}
                                                                                        <DropdownMenuItem className="w-full justify-end text-right" onClick={() => { setEditRow(row); setEditOpen(true); }}>تعديل</DropdownMenuItem>
                                                                                        <DropdownMenuItem className="w-full justify-end text-right" onClick={() => {
                                                                                            const key = registerCallback(() => {
                                                                                                if (onDelete && typeof onDelete === 'function') {
                                                                                                    onDelete(row.id);
                                                                                                } else {
                                                                                                    console.log('delete confirmed', row.id);
                                                                                                }
                                                                                            });
                                                                                            openModal({
                                                                                                isOpen: true,
                                                                                                type: 'failure',
                                                                                                title: 'تأكيد الحذف',
                                                                                                message: 'هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
                                                                                                actionName: 'حذف',
                                                                                                cancelTitle: 'إلغاء',
                                                                                                customActionKey: key,
                                                                                            });
                                                                                        }}>حذف</DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            )}
                                                                            {idx < renderedColumns.length && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-px bg-gray-200" />}
                                                                        </div>
                                                                    );
                                                                }

                                                                // default
                                                                // ensure badge-like cells don't wrap
                                                                if (key === 'badge' || key === 'coloredBadge') {
                                                                    return (
                                                                        <div key={key} className={cls} style={style}>
                                                                            <div className="truncate w-full text-center">{content}</div>
                                                                            {idx < renderedColumns.length && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-px bg-gray-200" />}
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div key={key} className={cls} style={style}>
                                                                        {content}
                                                                        {idx < renderedColumns.length && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-px bg-gray-200" />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* chevron-only toggle at row end */}
                                                        <div className="px-2 flex items-center">
                                                            <button
                                                                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : String(row.id)); }}
                                                                className="p-2 rounded hover:bg-gray-100"
                                                            >
                                                                <ChevronDown className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                {/* Accordion content */}
                                                <AccordionContent className="px-6 pb-4 pt-0 border-t bg-white">
                                                    {/* Resolve details content:
                                                        1. If a details component is provided for this row's type, render it.
                                                        2. Else if a column with key 'details' has a render function, use that.
                                                        3. Else render a default notes view.
                                                    */}
                                                    {(() => {
                                                        const type = row[rowTypeKey];
                                                        const Comp = type && detailsComponentMap[type];
                                                        if (Comp) return <Comp row={row} />;

                                                        const detailsCol = columns.find(c => c.key === 'details');
                                                        if (detailsCol && typeof detailsCol.render === 'function') {
                                                            return detailsCol.render(row);
                                                        }

                                                        return (
                                                            <div className="text-sm text-muted-foreground">
                                                                <div className="mt-1"><strong>Notes:</strong> {row.notes ?? '-'}</div>
                                                            </div>
                                                        );
                                                    })()}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </SortableRow>
                                )
                            })}
                        </div>
                    </SortableContext>
                </DndContext>

            </div>

            {/* Confirmation modal is provided globally via `GlobalModal` and opened with `openModal(...)` */}

            {/* If a `rowDialog` React element was passed from the parent (e.g. <SupplierDialog />),
                clone it and inject update-related props so it opens for the selected row. */}
            {rowDialog && React.isValidElement(rowDialog) && (
                React.cloneElement(rowDialog, {
                    mode: 'update',
                    initialData: editRow,
                    open: editOpen,
                    onOpenChange: (v) => setEditOpen(v),
                    // hide the trigger inside the cloned dialog (we open it programmatically)
                    triggerNode: <span style={{ display: 'none' }} />,
                    key: `row-dialog-${editRow ? editRow.id : 'none'}`
                })
            )}

            {/* Pagination footer */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                    <div className="text-sm">صفوف لكل صفحة</div>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0); }}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map(opt => <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-sm">
                        {Math.min(start + 1, total)} - {Math.min(end, total)} من {total}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={gotoLast} disabled={pageIndex >= pageCount - 1}>|&lt;</Button>
                        <Button size="sm" variant="ghost" onClick={gotoNext} disabled={pageIndex >= pageCount - 1}><HiChevronRight /></Button>
                        <Button size="sm" variant="ghost" onClick={gotoPrev} disabled={pageIndex === 0}><HiChevronLeft /></Button>
                        <Button size="sm" variant="ghost" onClick={gotoFirst} disabled={pageIndex === 0}>&gt;|</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Note: rendering of `rowDialog` is done by the parent component passing a
// React element via the `rowDialog` prop. We clone it and inject `mode`,
// `initialData`, `open`, and `onOpenChange` so the dialog behaves as an
// update dialog for the selected row.
