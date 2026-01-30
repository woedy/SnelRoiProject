import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Award,
  Search,
  Filter,
  Users,
  Building,
  GraduationCap,
  Heart,
  Lightbulb,
  TreePine
} from 'lucide-react';

interface Grant {
  id: string;
  title: string;
  category: string;
  amount: number;
  deadline: string;
  status: 'available' | 'applied' | 'approved' | 'rejected' | 'closed';
  description: string;
  eligibility: string[];
  provider: string;
  applicationDate?: string;
}

const mockGrants: Grant[] = [
  {
    id: '1',
    title: 'Small Business Innovation Grant',
    category: 'business',
    amount: 50000,
    deadline: '2026-03-15',
    status: 'available',
    description: 'Supporting innovative small businesses with funding for research and development projects.',
    eligibility: ['Small business owner', 'Less than 50 employees', 'Innovation focus'],
    provider: 'Department of Commerce'
  },
  {
    id: '2',
    title: 'Education Excellence Scholarship',
    category: 'education',
    amount: 15000,
    deadline: '2026-04-30',
    status: 'applied',
    description: 'Merit-based scholarship for outstanding students pursuing higher education.',
    eligibility: ['GPA 3.5 or higher', 'Full-time student', 'Financial need'],
    provider: 'Education Foundation',
    applicationDate: '2026-01-15'
  },
  {
    id: '3',
    title: 'Community Health Initiative Grant',
    category: 'healthcare',
    amount: 25000,
    deadline: '2026-02-28',
    status: 'approved',
    description: 'Funding for community health programs and medical research initiatives.',
    eligibility: ['Healthcare organization', 'Community impact focus', 'Non-profit status'],
    provider: 'Health Department',
    applicationDate: '2025-12-10'
  },
  {
    id: '4',
    title: 'Green Technology Development Fund',
    category: 'environment',
    amount: 75000,
    deadline: '2026-05-20',
    status: 'available',
    description: 'Supporting sustainable technology development and environmental conservation projects.',
    eligibility: ['Environmental focus', 'Technology innovation', 'Sustainability plan'],
    provider: 'Environmental Agency'
  },
  {
    id: '5',
    title: 'Arts and Culture Preservation Grant',
    category: 'arts',
    amount: 20000,
    deadline: '2026-01-31',
    status: 'closed',
    description: 'Preserving local arts and cultural heritage through community programs.',
    eligibility: ['Arts organization', 'Cultural preservation', 'Community engagement'],
    provider: 'Arts Council'
  }
];

const Grants = () => {
  const { t } = useLanguage();
  const [grants] = useState<Grant[]>(mockGrants);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>(mockGrants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Filter },
    { value: 'business', label: 'Business', icon: Building },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'technology', label: 'Technology', icon: Lightbulb },
    { value: 'environment', label: 'Environment', icon: TreePine },
    { value: 'arts', label: 'Arts & Culture', icon: Users }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'applied', label: 'Applied' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'closed', label: 'Closed' }
  ];

  React.useEffect(() => {
    let filtered = grants;

    if (searchTerm) {
      filtered = filtered.filter(grant =>
        grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(grant => grant.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(grant => grant.status === selectedStatus);
    }

    setFilteredGrants(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, grants]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Clock className="h-4 w-4" />;
      case 'applied':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Building className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleApplyForGrant = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = () => {
    if (selectedGrant) {
      toast({
        title: 'Application Submitted',
        description: `Your application for "${selectedGrant.title}" has been submitted successfully.`,
      });
      setShowApplicationForm(false);
      setSelectedGrant(null);
    }
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grant Services</h1>
          <p className="text-muted-foreground">Discover and apply for grants and funding opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {filteredGrants.filter(g => g.status === 'available').length} Available
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Grants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Grants</Label>
              <Input
                id="search"
                placeholder="Search by title, description, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant Listings */}
      {filteredGrants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No grants found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGrants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(grant.category)}
                      {grant.title}
                      <Badge className={getStatusColor(grant.status)}>
                        {getStatusIcon(grant.status)}
                        <span className="ml-1 capitalize">{grant.status}</span>
                      </Badge>
                      {isDeadlineSoon(grant.deadline) && grant.status === 'available' && (
                        <Badge variant="destructive" className="ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          Deadline Soon
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mb-2">
                      {grant.description}
                    </CardDescription>
                    <div className="text-sm text-muted-foreground">
                      Provider: {grant.provider}
                    </div>
                  </div>
                  {grant.status === 'available' && (
                    <Button onClick={() => handleApplyForGrant(grant)}>
                      Apply Now
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Grant Amount</p>
                      <p className="font-semibold">{formatCurrency(grant.amount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{formatDate(grant.deadline)}</p>
                    </div>
                  </div>

                  {grant.applicationDate && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Applied On</p>
                        <p className="font-semibold">{formatDate(grant.applicationDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />
                
                <div>
                  <p className="text-sm font-medium mb-2">Eligibility Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {grant.eligibility.map((requirement, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedGrant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Apply for Grant</CardTitle>
              <CardDescription>
                {selectedGrant.title} - {formatCurrency(selectedGrant.amount)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              
              <div>
                <Label htmlFor="organization">Organization (if applicable)</Label>
                <Input id="organization" placeholder="Enter organization name" />
              </div>
              
              <div>
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input id="projectTitle" placeholder="Enter your project title" />
              </div>
              
              <div>
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea 
                  id="projectDescription" 
                  placeholder="Describe your project and how it aligns with the grant objectives..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="requestedAmount">Requested Amount</Label>
                <Input 
                  id="requestedAmount" 
                  type="number" 
                  placeholder="Enter amount"
                  max={selectedGrant.amount}
                />
              </div>
              
              <div>
                <Label htmlFor="timeline">Project Timeline</Label>
                <Textarea 
                  id="timeline" 
                  placeholder="Describe your project timeline and milestones..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApplicationForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitApplication}>
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Grants;