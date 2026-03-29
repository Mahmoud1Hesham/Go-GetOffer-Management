"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MdClose, MdDone } from "react-icons/md";
import Input from '@/components/ui/common/reusable-input/reusableInput';
import { approveInfoChange, rejectInfoChange } from '@/app/services/supplierInfoChangeService';
import { toast } from 'sonner';

export default function SupplierInfoChangeContent({ row, refetch }) {
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const statusText = String(row.status ?? '').trim();
    const isPending = /قيد|pending/i.test(statusText);
    const isRejected = /رفض|مرفوض/.test(statusText);

    const handleAccept = async () => {
        setIsProcessing(true);
        const requestId = row.requestId || row.id;
        try {
            await approveInfoChange(requestId, row.changeType, '');
            toast.success("تم قبول الطلب بنجاح");
            if (refetch) refetch();
        } catch (error) {
            console.error('Accept error:', error);
            toast.error("حدث خطأ أثناء قبول الطلب");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectSend = async () => {
        if (!rejectReason.trim()) return;

        setIsProcessing(true);
        const requestId = row.requestId || row.id;
        try {
            await rejectInfoChange(requestId, row.changeType, rejectReason);
            toast.success("تم رفض الطلب بنجاح");
            setShowReject(false);
            setRejectReason('');
            if (refetch) refetch();
        } catch (error) {
            console.error('Reject error:', error);
            toast.error("حدث خطأ أثناء رفض الطلب");
        } finally {
            setIsProcessing(false);
        }
    };

    const renderValue = (valueStr) => {
        if (!valueStr) return 'غير متوفر';
        if (row.changeType === 'MainBranch' && valueStr.includes('/')) {
            const parts = valueStr.split('/');
            // Expected parts:
            // 0: branch name
            // 1: gov id
            // 2: gov name
            // 3: city id
            // 4: city name
            // 5: address details
            // 6: postal code
            // 7: phone numbers
            const branchName = parts[0] || '';
            const govName = parts[2] || '';
            const cityName = parts[4] || '';
            const addressDetails = parts[5] || '';
            const postalCode = parts[6] || '';
            const phoneNumbers = parts[7] || '';

            return (
                <div className="flex flex-col gap-2 mr-2 text-right text-sm">
                    {branchName && <div><span className="text-gray-500">اسم الفرع:</span> {branchName}</div>}
                    {govName && <div><span className="text-gray-500">المحافظة:</span> {govName}</div>}
                    {cityName && <div><span className="text-gray-500">المدينة:</span> {cityName}</div>}
                    {addressDetails && <div><span className="text-gray-500">العنوان:</span> {addressDetails}</div>}
                    {postalCode && <div><span className="text-gray-500">الرمز البريدي:</span> {postalCode}</div>}
                    {phoneNumbers && <div dir="ltr" className="text-right"><span className="text-gray-500">الهاتف:</span> {phoneNumbers}</div>}
                </div>
            );
        }
        return valueStr;
    };

    return (
        <div className="w-full text-sm py-5 px-4 bg-white">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-4 px-8">
                        <h4 className="font-semibold text-base">تفاصيل التغيير</h4>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span><strong className="text-gray-700">كود المورد:</strong> {row.authenticationUserId || 'غير متوفر'}</span>
                            {row.decisionAt && <span><strong className="text-gray-700">تاريخ القرار:</strong> {row.decisionAt}</span>}
                        </div>
                    </div>
                    <div className="flex items-start justify-between border-b pb-4 px-8">
                        <div className="flex flex-col gap-2 text-center items-center w-1/3 border-r border-gray-200">
                            <span className="text-gray-500 font-medium">نوع التغيير</span>
                            <span className="text-gray-800">{row.changeType || 'تغيير البريد الإلكتروني'}</span>
                        </div>
                        <div className="flex flex-col gap-2 text-center items-center w-1/3 border-r border-gray-200">
                            <span className="text-gray-500 font-medium">الطلب الحالي</span>
                            <div className="text-gray-500">{renderValue(row.oldValue)}</div>
                        </div>
                        <div className="flex flex-col gap-2 text-center items-center w-1/3">
                            <span className="text-gray-500 font-medium">الطلب الجديد</span>
                            <div className="font-semibold text-black">{renderValue(row.newValue)}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2 text-base px-8">سبب التغيير (تعليق المستخدم)</h4>
                    <p className="text-gray-600 text-sm leading-relaxed px-8">
                        {row.userComment || 'لا يوجد تعليق.'}
                    </p>
                </div>

                {isRejected && (
                    <div>
                        <h4 className="font-semibold mb-2 text-base text-red-600 px-8">سبب الرفض (تعليق الإدارة)</h4>
                        <p className="text-gray-600 text-sm leading-relaxed px-8">
                            {row.adminComment || 'تم الرفض لعدم استيفاء الشروط المطلوبة.'}
                        </p>
                    </div>
                )}

                {isPending && !showReject && (
                    <div className="flex items-center justify-end gap-4 mt-2 px-8">
                        <Button
                            variant="outline"
                            className="rounded-lg px-8 hover:text-white hover:bg-green-500 border-green-500 text-green-500 flex items-center gap-2"
                            onClick={handleAccept}
                            disabled={isProcessing}
                        >
                            قبول  <MdDone />
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-lg px-8 hover:text-white hover:bg-red-500 border-red-500 text-red-500 flex items-center gap-2"
                            onClick={() => setShowReject(true)}
                            disabled={isProcessing}
                        >
                            رفض <MdClose />
                        </Button>
                    </div>
                )}

                {showReject && isPending && (
                    <div className="mt-4 border-t pt-4 px-8 animate-in slide-in-from-top-2">
                        <h4 className="font-semibold mb-3">سبب الرفض (تعليق الإدارة)</h4>
                        <Input
                            type="textarea"
                            placeholder="اكتب سبب الرفض هنا..."
                            className="mb-4"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            <Button
                                variant="default"
                                className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                                onClick={handleRejectSend}
                                disabled={!rejectReason.trim() || isProcessing}
                            >
                                إرسال
                            </Button>
                            <Button
                                variant="outline"
                                className="px-8"
                                onClick={() => setShowReject(false)}
                                disabled={isProcessing}
                            >
                                العودة
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
