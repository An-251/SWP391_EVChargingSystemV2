import React, { useEffect, useState } from 'react';
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
  const { hasActiveSubscription, subscriptionCheckCompleted, loading } = useSelector(
    (state) => state.subscription
  );
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      console.log("🔒 [SUBSCRIPTION_GUARD] Checking subscription status...");
      console.log("👤 [SUBSCRIPTION_GUARD] User:", user);
      console.log("🔑 [SUBSCRIPTION_GUARD] isAuthenticated:", isAuthenticated);

      // Only check for drivers
      if (!isAuthenticated || !user) {
        console.log("⚠️ [SUBSCRIPTION_GUARD] User not authenticated, redirecting to login");
        setIsChecking(false);
        return;
      }

      // Only check for driver role
      if (user.role !== 'Driver') {
        console.log("ℹ️ [SUBSCRIPTION_GUARD] User is not a driver, skipping subscription check");
        setIsChecking(false);
        return;
      }

      // If already checked, don't check again
      if (subscriptionCheckCompleted) {
        console.log("✅ [SUBSCRIPTION_GUARD] Subscription already checked");
        setIsChecking(false);
        
        // If no active subscription, redirect to selection page
        if (!hasActiveSubscription && location.pathname !== '/driver/select-subscription') {
          console.log("❌ [SUBSCRIPTION_GUARD] No active subscription, redirecting to selection page");
          navigate('/driver/select-subscription', { replace: true });
        }
        return;
      }

      // Check subscription status via API
      if (user.driverId) {
        console.log("🔍 [SUBSCRIPTION_GUARD] Checking subscription for driverId:", user.driverId);
        
        try {
          await dispatch(checkSubscriptionStatus(user.driverId)).unwrap();
          console.log("✅ [SUBSCRIPTION_GUARD] Subscription check completed");
        } catch (error) {
          console.error("❌ [SUBSCRIPTION_GUARD] Subscription check failed:", error);
        } finally {
          setIsChecking(false);
        }
      } else {
        console.warn("⚠️ [SUBSCRIPTION_GUARD] No driverId found in user object");
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [dispatch, user, isAuthenticated, subscriptionCheckCompleted, navigate, location.pathname, hasActiveSubscription]);

  // Redirect to selection page if driver doesn't have active subscription
  useEffect(() => {
    if (
      !isChecking &&
      subscriptionCheckCompleted &&
      user?.role === 'Driver' &&
      !hasActiveSubscription &&
      location.pathname !== '/driver/select-subscription'
    ) {
      console.log("🚫 [SUBSCRIPTION_GUARD] Access denied - No active subscription");
      console.log("🔄 [SUBSCRIPTION_GUARD] Redirecting to subscription selection page");
      navigate('/driver/select-subscription', { replace: true });
    }
  }, [
    isChecking,
    subscriptionCheckCompleted,
    user,
    hasActiveSubscription,
    navigate,
    location.pathname,
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
  // 1. User is not a driver (admin/staff)
  // 2. Driver has active subscription
  // 3. Currently on subscription selection page
  if (
    user?.role !== 'Driver' ||
    hasActiveSubscription ||
    location.pathname === '/driver/select-subscription'
  ) {
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
