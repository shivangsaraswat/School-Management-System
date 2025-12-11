import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-[45%] relative bg-[#f8fafc]">
                <div className="absolute inset-0 flex items-end justify-start overflow-hidden">
                    <Image
                        src="/assets/login-visual.png"
                        alt="Authentication background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
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
