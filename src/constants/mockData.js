// src/data/mockData.js
export const CATEGORIES = [
  { id: 'all', label: 'All', icon: '✦' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'shelter', label: 'Shelter', icon: '🏠' },
];

export const URGENT = [
  {
    id: '1',
    imgBg: '#4A7C8A',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Medical',
    catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 80,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '12d left',
  },
  {
    id: '2',
    imgBg: '#4A7C8A',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Education',
    catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 20,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '12d left',
  },
  {
    id: '3',
    imgBg: '#4A7C8A',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Emergency',
    catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '12d left',
  },
  {
    id: '4',
    imgBg: '#4A7C8A',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Food',
    catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '12d left',
  },
  {
    id: '5',
    imgBg: '#4A7C8A',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Shelter',
    catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '12d left',
  },
  // ... other urgent items
];

export const FEATURED = [
  {
    id: '1',
    imgBg: '#4A7A5A',
    imgEmoji: '💧',
    title: 'Emergency Flood Relief 2024',
    raised: 'PKR 890K',
    goal: '1M',
    org: 'By Relief PK',
    pct: 20,
  },
  {
    id: '2',
    imgBg: '#4A7A5A',
    imgEmoji: '💧',
    title: 'Emergency Flood Relief 2024',
    raised: 'PKR 90K',
    goal: '1M',
    org: 'By Relief PK',
    pct: 74,
  },
  // ... other featured items
];

// src/data/mockData.js

// ... (your existing CATEGORIES, URGENT, FEATURED, CURRENT_USER exports)

export const MOCK_CAMPAIGNS = [
  {
    id: '1',
    title: 'Urgent Heart Surgery for Little Sara',
    imageUri:
      'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=200',
    raised: 'PKR 325K',
    goal: '500K',
    pct: 75,
    user: 'Ali Hassan',
    verified: true,
    category: 'medical',
  },
  {
    id: '2',
    title: 'Emergency Bypass for Father of 3',
    imageUri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200',
    raised: 'PKR 210K',
    goal: '500K',
    pct: 42,
    user: 'Bilal A.',
    verified: true,
    category: 'medical',
  },
  {
    id: '3',
    title: 'Support Open Heart Surgery Fund',
    imageUri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=200',
    raised: 'PKR 890K',
    goal: '1M',
    pct: 89,
    user: 'Hope NGO',
    verified: true,
    category: 'medical',
  },
  {
    id: '4',
    title: "Save Baby Ahmed's Heart",
    imageUri: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200',
    raised: 'PKR 45K',
    goal: '300K',
    pct: 15,
    user: 'Zainab K.',
    verified: false, // Set to false to see the difference
    category: 'medical',
  },
  {
    id: '5',
    title: 'Rural Clinic Heart Monitor Drive',
    imageUri:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200',
    raised: 'PKR 110K',
    goal: '200K',
    pct: 55,
    user: 'MediCare',
    verified: true,
    category: 'medical',
  },
  {
    id: '6',
    title: 'Scholarships for Underprivileged Girls',
    imageUri:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200',
    raised: 'PKR 180K',
    goal: '400K',
    pct: 45,
    user: 'EduTrust',
    verified: true,
    category: 'education',
  },
  {
    id: '7',
    title: 'Flood Relief for Balochistan Families',
    imageUri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200',
    raised: 'PKR 550K',
    goal: '1M',
    pct: 55,
    user: 'Relief PK',
    verified: true,
    category: 'emergency',
  },
  {
    id: '8',
    title: 'Winter Food Drive for Orphanage',
    imageUri:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200',
    raised: 'PKR 90K',
    goal: '150K',
    pct: 60,
    user: 'CareNow',
    verified: true,
    category: 'food',
  },
  {
    id: '9',
    title: 'Build a Home for a Homeless Family',
    imageUri:
      'https://images.unsplash.com/photo-1600585152225-3579fe9d7ae2?w=200',
    raised: 'PKR 1.2M',
    goal: '2.5M',
    pct: 48,
    user: 'Community Builders',
    verified: true,
    category: 'shelter',
  },
];

export const MOCK_SAVED = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    imageUri: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600',
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    category: 'medical',
  },
  {
    id: '6',
    title: 'Build a Primary School in Rural Sindh',
    imageUri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    raised: 'PKR 800,000',
    goal: '2,000,000',
    pct: 40,
    user: 'Sarah Ahmed',
    verified: true,
    category: 'education',
  },
];
export const CAMPAIGN_DETAIL = {
  id: '1',
  title: "Help Fatima's Heart Surgery",
  description: "Fatima is only 4 years old but she has been diagnosed with a critical heart defect. Her parents are struggling to make ends meet and cannot afford the surgery without help. Your donation can save her life.",
  imageUri: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600',
  raised: 125000,
  goal: 250000,
  donorsCount: 156,
  hoursLeft: 48,
  category: 'medical',
  creator: {
    name: 'Ali Hassan',
    location: 'Lahore, Pakistan',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
  },
  media: [
    { id: '1', uri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=200' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200' },
  ],
  recentDonations: [
    { id: '1', name: 'Zara M.', amount: 5000, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: '2', name: 'Usman K.', amount: 10000, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: '3', name: 'Anonymous', amount: 2500, avatar: 'https://randomuser.me/api/portraits/adventures/33.jpg' },
  ]
};
export const DONATION_HISTORY = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    amount: 5000,
    status: 'Completed',
    method: 'EasyPaisa',
    message: 'Get well soon little angel!',
    date: 'Jan 15, 2025 · 2:30 PM',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=120',
  },
  {
    id: '2',
    title: 'Education Fund for Street Children',
    amount: 2500,
    status: 'Completed',
    method: 'Visa ••42',
    message: '',
    date: 'Jan 10, 2025 · 10:15 AM',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120',
  },
  {
    id: '3',
    title: 'Emergency Flood Relief',
    amount: 10000,
    status: 'Pending',
    method: 'JazzCash',
    message: 'Praying for safe delivery.',
    date: 'Dec 28, 2024 · 9:45 PM',
    image: 'https://images.unsplash.com/photo-1534274178914-881dc4a62df4?w=120',
  },
];

export const MY_CAMPAIGNS_DATA = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    status: 'Active',
    image: 'https://picsum.photos/id/237/200',
    raised: 325000,
    goal: 500000,
    daysLeft: 12,
    actions: ['View', 'Update', 'Withdraw'],
  },
  {
    id: '2',
    title: 'Emergency Flood Relief for Dadu',
    status: 'Pending',
    image: 'https://picsum.photos/id/1016/200',
    submittedOn: 'Jan 14, 2025',
    note: 'Under review.',
    actions: [],
  },
  {
    id: '3',
    title: 'Education Fund for...',
    status: 'Draft',
    image: 'https://picsum.photos/id/1011/200',
    lastEdited: '2 days ago',
    actions: ['Edit', 'Delete'],
  },
  {
    id: '4',
    title: 'Medical Supplies Support',
    status: 'Rejected',
    image: 'https://picsum.photos/id/1059/200',
    reason: '"Missing valid medical verification documents."',
    actions: ['Edit & Resubmit'],
  },
];
export const WITHDRAWAL_DATA = {
  campaignTitle: "Help Fatima's Heart Surgery",
  raised: 325000,
  withdrawn: 100000,
  available: 225000, // Available Balance
};

export const MOCK_CREATOR = {
  id: '1',
  name: 'Sarah Ahmed',
  username: '@sarahahmed',
  avatar: 'https://i.pravatar.cc/300?img=32',
  location: 'Karachi, Pakistan',
  joinedDate: 'March 2023',
  isVerified: true,
  totalCampaigns: 12,
  totalRaised: '4.5M',
  totalDonors: 234,
  rating: 4.8,
  trustScore: 92,
};

export const STATS_DATA = [
  { label: 'Campaigns', value: '12' },
  { label: 'Raised', value: 'PKR 4.5M' },
  { label: 'Donors', value: '234' },
  { label: 'Rating', value: '4.8★' },
];

export const MOCK_REVIEWS = [
  {
    id: '1',
    donorName: 'Ahmed K.',
    donorAvatar: 'https://i.pravatar.cc/300?img=12',
    rating: 5,
    date: '2 days ago',
    comment: 'Sarah is incredibly transparent and provided regular updates throughout the campaign.',
    helpful: 12,
  },
];

export const PAYMENT_METHODS = [
  { id: 'easypaisa', label: 'EasyPaisa', placeholder: '03XX XXXXXXX' },
  { id: 'jazzcash', label: 'JazzCash', placeholder: '03XX XXXXXXX' },
  { id: 'bank', label: 'Bank Transfer', placeholder: 'IBAN / Account Number' },
];
export const CAMPAIGN_TABS = ['All', 'Active', 'Pending', 'Draft'];

export const STATUS_CONFIG = {
  Active:   { label: 'ACTIVE',   bg: '#DCFCE7', text: '#16A34A' },
  Pending:  { label: 'PENDING',  bg: '#FEF3C7', text: '#D97706' },
  Draft:    { label: 'DRAFT',    bg: '#F3F4F6', text: '#6B7280' },
  Rejected: { label: 'REJECTED', bg: '#FEE2E2', text: '#DC2626' },
};

export const CURRENT_USER = {
  name: 'Ahmed Khan',
  email: 'ahmed@gmail.com',
  avatarUri: null,
};