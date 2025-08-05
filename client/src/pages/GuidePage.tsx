import Header from "@/components/Header";
import UserGuide from "@/components/UserGuide";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header currentRole="" onRoleChange={() => {}} />
      <UserGuide />
    </div>
  );
}