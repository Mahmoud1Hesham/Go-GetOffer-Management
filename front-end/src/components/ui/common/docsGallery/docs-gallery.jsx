'use client';

import React, { useEffect, useState, useCallback } from 'react';

// We'll dynamically import `react-pdf` on the client to avoid server-side
// evaluation issues from `pdfjs-dist` (which can call Object.defineProperty
// on non-objects during SSR/build). While loading we show placeholders.
// After import we also set the workerSrc.

/**
 * items: [
 *  { id: '1', type: 'image'|'pdf', src: 'https://...', title: '...' },
 *  ...
 * ]
 */
export default function DocsGallery({ items = [], thumbWidth = 160, thumbHeight = 200 }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(null); // active item
    const [blobMap, setBlobMap] = useState({});

    // Fetch a given URL as blob and store object URL in blobMap[src] = { url, loading, error }
    const fetchAsBlob = async (src) => {
        if (!src) return;
        setBlobMap(prev => {
            if (prev[src]) return prev; // already known
            return { ...prev, [src]: { loading: true } };
        });

        try {
            const res = await fetch(src);
            if (!res.ok) throw new Error('network');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setBlobMap(prev => ({ ...prev, [src]: { url } }));
        } catch (e) {
            setBlobMap(prev => ({ ...prev, [src]: { error: true } }));
        }
    };

    // Prefetch PDF blobs for thumbnails (client-side only)
    useEffect(() => {
        const pdfs = (items || []).filter(it => it && it.type === 'pdf' && it.src);
        for (const p of pdfs) {
            // start fetch but don't await
            fetchAsBlob(p.src);
        }
        return () => {
            // revoke object URLs on unmount
            Object.values(blobMap).forEach(v => {
                if (v && v.url) try { URL.revokeObjectURL(v.url); } catch (e) { }
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    // lock body scrolling when modal open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // keyboard close (Esc)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // NOTE: react-pdf/pdfjs can execute browser-only code during import which
    // may break in this environment. To avoid runtime errors we use a simple
    // iframe fallback for PDF previews instead of importing `react-pdf`.

    const openModal = useCallback((item) => {
        setActive(item);
        setOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setOpen(false);
        // small timeout to let modal animate if you add animation
        setTimeout(() => setActive(null), 200);
    }, []);

    // NOTE: numPages is not tracked because we do not use `react-pdf` here.

    return (
        <>
            {/* Grid of thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((it) => (
                    <div
                        key={it.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openModal(it)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(it); } }}
                        className="flex flex-col items-center text-left bg-white/5 hover:bg-white/10 rounded overflow-hidden focus:outline-none"
                        title={it.title || (it.type === 'pdf' ? 'PDF' : 'Image')}
                    >
                        <div
                            className="w-full flex items-center justify-center bg-gray-50/5"
                            style={{ height: thumbHeight }}
                        >
                            {it.type === 'image' ? (
                                <img
                                    src={it.src}
                                    alt={it.title || 'image thumbnail'}
                                    className="object-contain max-h-full max-w-full"
                                    loading="lazy"
                                />
                            ) : (
                                // PDF thumbnail: prefer to render the PDF via a same-origin
                                // object URL created from a fetched blob to avoid X-Frame-Options
                                // restrictions. If fetch fails or is pending, show a fallback
                                // placeholder with an open-in-new-tab link.
                                <div className="w-full h-full flex items-center justify-center p-2">
                                    {blobMap[it.src] && blobMap[it.src].url ? (
                                        <embed
                                            src={blobMap[it.src].url}
                                            type="application/pdf"
                                            title={it.title || 'pdf-preview'}
                                            className="w-full h-full"
                                            style={{ border: 'none' }}
                                        />
                                    ) : blobMap[it.src] && blobMap[it.src].loading ? (
                                        <div className="text-sm">جاري التحميل...</div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                                            <div className="text-3xl">📄</div>
                                            <div className="text-xs truncate text-center">{it.title || 'PDF'}</div>
                                            <div className=" flex flex-col items-center gap-2 w-full">
                                                <a href={blobMap[it.src]?.url ?? it.src} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-gray-100 w-full text-center">فتح في نافذة جديدة</a>
                                                <button onClick={() => fetchAsBlob(it.src)} className="text-xs px-2 py-1 rounded bg-primary-600 text-white w-3/4">محاولة التحميل</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="w-full px-2 py-1 text-xs text-left truncate">
                            {it.title || (it.type === 'pdf' ? 'PDF Document' : 'Image')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {open && active && (
                <div
                    aria-modal="true"
                    role="dialog"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* modal content */}
                    <div className="relative z-10 max-w-[95vw] max-h-[90vh] w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden flex flex-col">
                        {/* header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-neutral-800">
                            <div className="text-sm font-medium truncate">{active.title || (active.type === 'pdf' ? 'PDF Document' : 'Image')}</div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={closeModal}
                                    className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                                    aria-label="Close"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>

                        {/* body */}
                        <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
                            {active.type === 'image' ? (
                                <img
                                    src={active.src}
                                    alt={active.title || 'image preview'}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            ) : (
                                <div className="w-full max-h-[80vh] overflow-auto">
                                    {blobMap[active.src] && blobMap[active.src].url ? (
                                        <object
                                            data={blobMap[active.src].url}
                                            type="application/pdf"
                                            title={active.title || 'pdf-view'}
                                            className="w-full"
                                            style={{ height: Math.min(1000, typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.8) : 800), border: 'none' }}
                                        >
                                            <div className="p-6 text-center">
                                                <div>المعاينة غير مدعومة في هذا المتصفح.</div>
                                                <div className="mt-2">
                                                    <a href={blobMap[active.src]?.url ?? active.src} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded bg-gray-100">فتح في نافذة جديدة</a>
                                                </div>
                                            </div>
                                        </object>
                                    ) : blobMap[active.src] && blobMap[active.src].loading ? (
                                        <div className="p-6 text-center">جاري تحميل الملف...</div>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <div>لا يمكن عرض المعاينة داخليًا.</div>
                                                <div className="mt-2 flex items-center gap-2 justify-center">
                                                    <a href={blobMap[active.src]?.url ?? active.src} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded bg-gray-100">فتح في نافذة جديدة</a>
                                                    <a href={blobMap[active.src]?.url ?? active.src} download className="text-sm px-3 py-1 rounded bg-primary-600 text-white">تحميل</a>
                                                    <button onClick={() => fetchAsBlob(active.src)} className="text-sm px-3 py-1 rounded bg-amber-500 text-white">محاولة التحميل</button>
                                                </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* footer / actions */}
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                            <div className="text-xs text-gray-500">نوع الملف: {active.type.toUpperCase()}</div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={blobMap[active.src]?.url ?? active.src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                >
                                    فتح في نافذة جديدة
                                </a>
                                <a
                                    href={blobMap[active.src]?.url ?? active.src}
                                    download
                                    className="text-sm px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700"
                                >
                                    تحميل
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
