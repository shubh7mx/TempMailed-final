
import { Logo } from "@/components/logo";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Logo className="w-20 h-20 animate-pulse" />
    </div>
  );
}
