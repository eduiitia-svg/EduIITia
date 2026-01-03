export const getActiveSubscription = (subscriptions) => {
  if (!subscriptions) {
    return null;
  }

  let subsArray = [];
  
  if (Array.isArray(subscriptions)) {
    subsArray = subscriptions;
  } else if (typeof subscriptions === 'object') {
    const keys = Object.keys(subscriptions).filter(key => !isNaN(key));
    if (keys.length > 0) {
      subsArray = keys.map(key => subscriptions[key]);
    } else if (subscriptions.plan || subscriptions.endDate) {
      subsArray = [subscriptions];
    }
  }
  
  const now = new Date();
  
  return subsArray.find((sub) => {
    if (!sub || typeof sub !== 'object') return false;
    
    if (sub.isActive === false) return false;
    if (!sub.endDate) return false;
    
    const endDate = sub.endDate?.seconds 
      ? new Date(sub.endDate.seconds * 1000)
      : new Date(sub.endDate);
    return endDate > now;
  }) || null;
};

export const isSubscriptionActive = (subscriptions) => {
  return !!getActiveSubscription(subscriptions);
};

export const getDaysRemaining = (subscription) => {
  if (!subscription?.endDate) return 0;

  const endDate = subscription.endDate.seconds
    ? new Date(subscription.endDate.seconds * 1000)
    : new Date(subscription.endDate);

  const now = new Date();
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

export const getTimeRemaining = (subscription) => {
  if (!subscription?.endDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      isExpiringSoon: false,
      isExpiringToday: false,
    };
  }

  const endDate = subscription.endDate.seconds
    ? new Date(subscription.endDate.seconds * 1000)
    : new Date(subscription.endDate);

  const now = new Date();
  const diffTime = endDate - now;
  if (diffTime <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0,
      isExpiringSoon: false,
      isExpiringToday: false,
    };
  }

  const totalMinutes = Math.floor(diffTime / (1000 * 60));
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return {
    days,
    hours,
    minutes,
    totalHours,
    totalMinutes,
    isExpiringSoon: days <= 7,
    isExpiringToday: days === 0,
  };
};

export const formatTimeRemaining = (subscription) => {
  const timeData = getTimeRemaining(subscription);
  
  if (timeData.days === 0 && timeData.hours === 0 && timeData.minutes === 0) {
    return "Expired";
  }

  const parts = [];

  if (timeData.days > 0) {
    parts.push(`${timeData.days} day${timeData.days !== 1 ? 's' : ''}`);
  }

  if (timeData.hours > 0) {
    parts.push(`${timeData.hours} hour${timeData.hours !== 1 ? 's' : ''}`);
  }

  if (timeData.days === 0 && timeData.minutes > 0) {
    parts.push(`${timeData.minutes} minute${timeData.minutes !== 1 ? 's' : ''}`);
  }

  return parts.join(', ');
};


export const formatTimeRemainingShort = (subscription) => {
  const timeData = getTimeRemaining(subscription);
  
  if (timeData.days === 0 && timeData.hours === 0 && timeData.minutes === 0) {
    return "Expired";
  }

  const parts = [];

  if (timeData.days > 0) {
    parts.push(`${timeData.days}d`);
  }

  if (timeData.hours > 0) {
    parts.push(`${timeData.hours}h`);
  }

  if (timeData.days === 0 && timeData.minutes > 0) {
    parts.push(`${timeData.minutes}m`);
  }

  return parts.join(' ');
};