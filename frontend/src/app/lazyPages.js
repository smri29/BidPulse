import { lazy } from 'react';

// Central lazy import map keeps route configuration readable.
export const Home = lazy(() => import('../pages/Home'));
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));
export const AuctionDetails = lazy(() => import('../pages/AuctionDetails'));
export const About = lazy(() => import('../pages/About'));
export const HowItWorks = lazy(() => import('../pages/HowItWorks'));
export const Safety = lazy(() => import('../pages/Safety'));
export const HelpCenter = lazy(() => import('../pages/HelpCenter'));
export const Terms = lazy(() => import('../pages/Terms'));
export const Privacy = lazy(() => import('../pages/Privacy'));
export const Profile = lazy(() => import('../pages/Profile'));
export const ProfileVerificationLink = lazy(() => import('../pages/ProfileVerificationLink'));
export const Settings = lazy(() => import('../pages/Settings'));
export const Notifications = lazy(() => import('../pages/Notifications'));
export const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
export const ResetPassword = lazy(() => import('../pages/ResetPassword'));
export const BidderDashboard = lazy(() => import('../pages/dashboard/BidderDashboard'));
export const SellerDashboard = lazy(() => import('../pages/dashboard/SellerDashboard'));
export const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
export const AdminUsers = lazy(() => import('../pages/dashboard/AdminUsers'));
export const AdminAuctions = lazy(() => import('../pages/dashboard/AdminAuctions'));
export const AdminSupport = lazy(() => import('../pages/dashboard/AdminSupport'));
export const AdminProfile = lazy(() => import('../pages/dashboard/AdminProfile'));
export const CreateAuction = lazy(() => import('../pages/dashboard/CreateAuction'));
export const EditAuction = lazy(() => import('../pages/dashboard/EditAuction'));
export const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess'));
export const NotFound = lazy(() => import('../pages/NotFound'));

