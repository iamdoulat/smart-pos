import Image from "next/image";
import bgImg from "@/assets/auth-bg.png";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-950">
            {/* Full Screen Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Image
                    src={bgImg}
                    alt="Background"
                    fill
                    className="object-cover opacity-40 dark:opacity-50 blur-[1px]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/10 to-transparent dark:from-zinc-950 dark:via-zinc-950/10 dark:to-transparent" />
            </div>

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] pointer-events-none" />

            <div className="w-full z-10 relative flex flex-col items-center p-4">
                {children}
            </div>
        </div>
    );
}
