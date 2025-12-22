export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-white overflow-hidden">
            {/* Left Side - Semicircle Design */}
            <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center bg-white z-0">
                {/* Backing 'Sliver' Layer - Lighter Trace */}
                <div
                    className="absolute top-0 bottom-0 left-0 bg-[#eb5a62]/15"
                    style={{
                        width: '108%',
                        borderTopRightRadius: '50% 50%',
                        borderBottomRightRadius: '50% 50%',
                        zIndex: 5
                    }}
                />

                {/* Main Curve Shape */}
                <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-br from-[#eb5a62] via-[#eb5a62] to-[#d6454d]"
                    style={{
                        width: '105%',
                        borderTopRightRadius: '50% 50%',
                        borderBottomRightRadius: '50% 50%',
                        zIndex: 10
                    }}
                />

                {/* Content - Centered relative to the panel, slightly offset for visual balance */}
                <div className="relative z-20 flex flex-col items-center text-center w-full px-10">
                    {/* Logo Icon */}
                    <div className="w-24 h-24 xl:w-28 xl:h-28 rounded-full bg-white shadow-xl shadow-black/10 flex items-center justify-center mb-6 relative">
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg" />
                        {/* Logo SVG */}
                        <svg className="w-14 h-14 xl:w-16 xl:h-16 relative z-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Graduation Cap */}
                            <path d="M32 8L4 20L32 32L60 20L32 8Z" fill="#eb5a62" />
                            <path d="M32 32L4 20V28L32 40L60 28V20L32 32Z" fill="#d6454d" />
                            <path d="M12 24V42L32 52L52 42V24L32 34L12 24Z" fill="#0f172a" />
                            {/* Book underneath */}
                            <path d="M22 44V56L32 60L42 56V44L32 48L22 44Z" fill="#eb5a62" opacity="0.8" />
                            {/* Tassel */}
                            <path d="M56 20V36" stroke="#eb5a62" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="56" cy="38" r="3" fill="#eb5a62" />
                        </svg>
                    </div>

                    {/* School Name */}
                    <h2 className="text-2xl xl:text-3xl font-bold text-white mb-2 drop-shadow-md tracking-wide">
                        School Management
                    </h2>
                    <p className="text-white/80 text-base xl:text-lg font-medium tracking-wide">
                        Admin Dashboard
                    </p>

                    {/* Decorative line */}
                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                    </div>

                    {/* Tagline */}
                    <p className="mt-6 text-white/70 text-sm font-medium max-w-[260px] leading-relaxed">
                        Empowering Education Through Smart Management
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full lg:w-[55%] items-center justify-center bg-white p-8">
                <div className="w-full max-w-[440px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
