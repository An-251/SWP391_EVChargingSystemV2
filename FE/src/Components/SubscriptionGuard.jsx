import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Spin } from 'antd';
import { checkSubscriptionStatus } from '../redux/subscription/subscriptionSlice';

/**
 * SubscriptionGuard - Component to protect driver routes
 * Ensures driver has an active subscription before accessing the app
 */
const SubscriptionGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { 
    hasActiveSubscription, 
    subscriptionCheckCompleted, 
    loading,
    activeSubscription 
  } = useSelector((state) => state.subscription);
  
  const [isChecking, setIsChecking] = useState(true);
  
  // ⭐ Use ref to prevent multiple checks AND redirects
  const hasCheckedRef = useRef(false);
  const hasRedirectedRef = useRef(false); // ⭐ NEW: Track if already redirected
  
  // Extract stable values
  const driverId = user?.driverId;
  const userRole = user?.role;

  // ⭐ Reset redirect flag when subscription status changes from false to true
  useEffect(() => {
    if (hasActiveSubscription && hasRedirectedRef.current) {
      console.log('✅ [SUBSCRIPTION_GUARD] Subscription acquired, clearing redirect flag');
      hasRedirectedRef.current = false;
    }
  }, [hasActiveSubscription]);

  useEffect(() => {
    const checkSubscription = async () => {
      // Only check ONCE using ref
      if (hasCheckedRef.current) {
        return;
      }

      // Only check for authenticated drivers
      if (!isAuthenticated || !userRole) {
        setIsChecking(false);
        return;
      }

      // Skip if not a driver (Admin, Staff, Enterprise don't need subscription check)
      if (userRole !== 'Driver') {
        setIsChecking(false);
        hasCheckedRef.current = true;
        return;
      }

      // If already checked by Redux, use that
      if (subscriptionCheckCompleted) {
        setIsChecking(false);
        hasCheckedRef.current = true;
        return;
      }

      // Check subscription via API
      if (driverId) {
        try {
          await dispatch(checkSubscriptionStatus(driverId)).unwrap();
        } catch (error) {
          console.error("❌ [SUBSCRIPTION_GUARD] Check failed:", error);
        } finally {
          setIsChecking(false);
          hasCheckedRef.current = true;
        }
      } else {
        setIsChecking(false);
        hasCheckedRef.current = true;
      }
    };

    checkSubscription();
  }, [dispatch, driverId, userRole, isAuthenticated, subscriptionCheckCompleted]);

  // Redirect to selection page if driver doesn't have active subscription
  // ⭐ CRITICAL: Only run ONCE on initial check, not on every route change
  useEffect(() => {
    // Only check redirect after initial check is done
    if (!isChecking && subscriptionCheckCompleted && hasCheckedRef.current) {
      const isDriver = userRole === 'Driver';
      const isOnSelectionPage = location.pathname === '/driver/select-subscription';
      
      // ⭐ IMPORTANT: Only redirect if we haven't already redirected AND user needs subscription
      if (isDriver && !hasActiveSubscription && !isOnSelectionPage && !hasRedirectedRef.current) {
        console.log('🚨 [SUBSCRIPTION_GUARD] Redirecting to selection page');
        hasRedirectedRef.current = true; // ⭐ Mark as redirected
        navigate('/driver/select-subscription', { replace: true });
      }
    }
  }, [
    isChecking,
    subscriptionCheckCompleted,
    userRole,
    hasActiveSubscription,
    navigate,
    // ⭐ REMOVED location.pathname from dependencies to prevent re-run on navigation
  ]);

  // Show loading spinner while checking
  if (isChecking || loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Spin size="large" tip="Đang kiểm tra thông tin đăng ký..." />
      </div>
    );
  }

  // Allow access if:
  // 1. User is not a driver (admin/staff/enterprise)
  // 2. Driver has active subscription
  // 3. Currently on subscription selection page
  const shouldAllowAccess = 
    user?.role !== 'Driver' ||
    hasActiveSubscription ||
    location.pathname === '/driver/select-subscription';

  // ⭐ Debug logging
    console.log('🛡️ [SUBSCRIPTION_GUARD] Access check:', {
      role: user?.role,
      hasActiveSubscription,
      currentPath: location.pathname,
      shouldAllowAccess,
      hasRedirected: hasRedirectedRef.current,
      isChecking,
      subscriptionCheckCompleted,
      activeSubscription,
    });  if (shouldAllowAccess) {
    return <>{children}</>;
  }

  // Fallback - show loading (shouldn't reach here due to useEffect redirect)
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Spin size="large" tip="Đang chuyển hướng..." />
    </div>
  );
};

export default SubscriptionGuard;
