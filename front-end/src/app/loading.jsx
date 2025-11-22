export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gradient-to-b from-blue-700  to-purple-800">
            <video
                src="/assets/loader/loader.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="h-62 w-62 object-contain"
            />
        </div>
    );
}
