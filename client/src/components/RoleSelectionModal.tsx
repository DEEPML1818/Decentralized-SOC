import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/components/providers/WalletProvider";
import { User, Shield, Award, AlertCircle, CheckCircle, Eye } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: string) => void;
}

const roles = [
  {
    id: "client",
    title: "Security Client",
    description: "Submit cybersecurity incidents and get expert analysis",
    icon: Shield,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    features: [
      "Submit security incidents",
      "Track incident status",
      "Receive expert analysis",
      "Stake tokens for priority"
    ]
  },
  {
    id: "analyst",
    title: "Security Analyst",
    description: "Analyze incidents and provide professional assessments",
    icon: Users,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    features: [
      "Analyze security incidents",
      "Provide expert reports",
      "Earn CLT tokens",
      "Build reputation"
    ]
  },
  {
    id: "certifier",
    title: "Certifier",
    description: "Validate and approve analyst reports for quality assurance",
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    features: [
      "Review analyst reports",
      "Validate incident analysis",
      "Ensure quality standards",
      "Earn validation rewards"
    ]
  },
  {
    id: "observer",
    title: "Observer",
    description: "View public incident data and platform statistics",
    icon: Eye,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    features: [
      "View public incidents",
      "Access platform statistics",
      "Monitor system health",
      "Research security trends"
    ]
  }
];

export default function RoleSelectionModal({ isOpen, onClose, onRoleSelect }: RoleSelectionModalProps) {
  const { assignRole } = useWallet();
  const { toast } = useToast();

  const handleRoleSelection = async (role: string) => {
    const success = await assignRole(role);
    if (success) {
      onRoleSelect(role);
      onClose();
      toast({
        title: "Role Assigned",
        description: `You are now registered as a ${role}`,
      });
    } else {
      toast({
        title: "Role Assignment Failed",
        description: "This address may already have a different role assigned",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-white">
            Choose Your Role in dSOC
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Select how you want to participate in the decentralized security ecosystem
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {roles && roles.map((role) => {
            const IconComponent = role.icon;
            // For now, we won't use selectedRole state here as the selection is handled directly by handleRoleSelection
            // const isSelected = selectedRole === role.id; 

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 border-slate-700 bg-slate-800/50 hover:border-slate-600`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${role.bgColor} flex items-center justify-center mb-3`}>
                    <IconComponent className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <CardTitle className={`${role.color} text-lg`}>
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features && role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-gray-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          {/* The confirmation button logic is now handled within handleRoleSelection */}
        </div>
      </DialogContent>
    </Dialog>
  );
}