import React, { useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  Shield, 
  CheckCircle, 
  Clock, 
  Wallet, 
  Star,
  TrendingUp,
  FileText,
  Settings,
  Database,
  Users,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import TicketList from './TicketList';
import UnifiedStakingDashboard from './UnifiedStakingDashboard';
import CasesList from './CasesList';

interface UserRole {
  address: string;
  role: 'client' | 'analyst' | 'certifier' | null;
}

interface ProfileData {
  name: string;
  expertise: string[];
  experience: string;
  certifications: string[];
  bio: string;
}

export function RoleDashboard() {
  const { connectedAccount: wallet, connectWallet } = useWallet();
  const isConnected = !!wallet;
  const [selectedRole, setSelectedRole] = useState<'client' | 'analyst' | 'certifier' | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    expertise: [],
    experience: '',
    certifications: [],
    bio: ''
  });
  const queryClient = useQueryClient();

  // Get user role
  const { data: userRole, isLoading: roleLoading } = useQuery<UserRole>({
    queryKey: [`/api/roles/${wallet}`],
    enabled: isConnected && !!wallet,
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async (role: 'client' | 'analyst' | 'certifier') => {
      const response = await apiRequest('/api/roles/assign', {
        method: 'POST',
        body: JSON.stringify({ address: wallet, role }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/roles/${wallet}`] });
      setIsRegistering(false);
    }
  });

  // Store profile in IPFS mutation
  const storeProfileMutation = useMutation({
    mutationFn: async ({ role, profile }: { role: string, profile: ProfileData }) => {
      const endpoint = role === 'analyst' ? '/api/ipfs/store-analyst' : '/api/ipfs/store-certifier';
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          address: wallet,
          profile,
          registrationDate: new Date().toISOString()
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response;
    },
    onSuccess: () => {
      setIsRegistering(false);
      setProfileData({ name: '', expertise: [], experience: '', certifications: [], bio: '' });
    }
  });

  const handleRoleAssignment = async (role: 'client' | 'analyst' | 'certifier') => {
    if (!wallet) return;
    
    // For analysts and certifiers, we need profile data
    if ((role === 'analyst' || role === 'certifier') && !isRegistering) {
      setSelectedRole(role);
      setIsRegistering(true);
      return;
    }

    try {
      await assignRoleMutation.mutateAsync(role);
      
      // Store profile in IPFS for analysts and certifiers
      if ((role === 'analyst' || role === 'certifier') && isRegistering) {
        await storeProfileMutation.mutateAsync({ role, profile: profileData });
      }
    } catch (error) {
      console.error('Role assignment error:', error);
    }
  };

  const handleExpertiseAdd = (expertise: string) => {
    if (expertise.trim() && !profileData.expertise.includes(expertise.trim())) {
      setProfileData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertise.trim()]
      }));
    }
  };

  const handleCertificationAdd = (cert: string) => {
    if (cert.trim() && !profileData.certifications.includes(cert.trim())) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert.trim()]
      }));
    }
  };

  // Show wallet connection if not connected
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Connect your wallet to access the dSOC platform and select your role.
            </p>
            <Button onClick={connectWallet} className="w-full bg-orange-500 hover:bg-orange-600">
              Connect MetaMask Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show role selection if no role assigned
  if (!roleLoading && (!userRole?.role || userRole.role === null)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <Users className="mx-auto h-12 w-12 text-blue-500 mb-4" />
            <CardTitle className="text-2xl">Select Your Role</CardTitle>
            <p className="text-gray-600">
              Choose your role in the dSOC ecosystem. Each address can only have one role.
            </p>
          </CardHeader>
          <CardContent>
            {!isRegistering ? (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Client Role */}
                <Card className="cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => handleRoleAssignment('client')}>
                  <CardHeader className="text-center">
                    <User className="mx-auto h-8 w-8 text-blue-500" />
                    <CardTitle className="text-lg">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Submit security incidents</li>
                      <li>• Create analysis tickets</li>
                      <li>• Choose analysts for cases</li>
                      <li>• Manage security issues</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Analyst Role */}
                <Card className="cursor-pointer hover:border-green-500 transition-colors"
                      onClick={() => handleRoleAssignment('analyst')}>
                  <CardHeader className="text-center">
                    <Shield className="mx-auto h-8 w-8 text-green-500" />
                    <CardTitle className="text-lg">Analyst</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Submit security analysis</li>
                      <li>• Earn CLT rewards</li>
                      <li>• Join staking pools</li>
                      <li>• Validate findings</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Certifier Role */}
                <Card className="cursor-pointer hover:border-purple-500 transition-colors"
                      onClick={() => handleRoleAssignment('certifier')}>
                  <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-purple-500" />
                    <CardTitle className="text-lg">Certifier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Review analyst submissions</li>
                      <li>• Shortlist candidates</li>
                      <li>• Verify analysis quality</li>
                      <li>• Cannot certify own work</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                <Alert>
                  <AlertDescription>
                    Complete your {selectedRole} profile to join the dSOC platform.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Describe your background and experience..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g., 5 years in cybersecurity"
                    />
                  </div>

                  <div>
                    <Label>Expertise Areas</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileData.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                          <button
                            onClick={() => setProfileData(prev => ({
                              ...prev,
                              expertise: prev.expertise.filter(s => s !== skill)
                            }))}
                            className="ml-1 text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add expertise (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleExpertiseAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label>Certifications</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profileData.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                          <button
                            onClick={() => setProfileData(prev => ({
                              ...prev,
                              certifications: prev.certifications.filter(c => c !== cert)
                            }))}
                            className="ml-1 text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add certification (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCertificationAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleRoleAssignment(selectedRole!)}
                    className="flex-1"
                    disabled={!profileData.name || !profileData.bio || assignRoleMutation.isPending}
                  >
                    {assignRoleMutation.isPending ? 'Registering...' : `Register as ${selectedRole}`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRegistering(false);
                      setSelectedRole(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main role-based dashboard
  const currentRole = userRole?.role;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with wallet and role info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {currentRole === 'client' && <User className="h-6 w-6 text-blue-500" />}
            {currentRole === 'analyst' && <Shield className="h-6 w-6 text-green-500" />}
            {currentRole === 'certifier' && <CheckCircle className="h-6 w-6 text-purple-500" />}
            <div>
              <h1 className="text-2xl font-bold">
                {currentRole === 'client' && 'Client Dashboard'}
                {currentRole === 'analyst' && 'Analyst Dashboard'}
                {currentRole === 'certifier' && 'Certifier Dashboard'}
              </h1>
              <p className="text-gray-600 text-sm">
                {wallet?.slice(0, 8)}...{wallet?.slice(-6)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={currentRole === 'client' ? 'default' : 
                   currentRole === 'analyst' ? 'secondary' : 'outline'}
            className="capitalize"
          >
            {currentRole}
          </Badge>
        </div>
      </div>

      {/* Role-specific dashboard content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases & Tickets</TabsTrigger>
          <TabsTrigger value="staking">Staking Pools</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">12</div>
                <p className="text-sm text-gray-600">Currently processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  CLT Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">1,250</div>
                <p className="text-sm text-gray-600">Current balance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">94%</div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          {currentRole === 'client' && <TicketList />}
          {currentRole === 'analyst' && <CasesList />}
          {currentRole === 'certifier' && <CasesList />}
        </TabsContent>

        <TabsContent value="staking" className="mt-6">
          <UnifiedStakingDashboard />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New security ticket submitted</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Analysis completed and rewarded</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Staking pool joined successfully</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}