import { getSingleton, setSingleton } from '../store.js';

export const DEFAULT_SECTION_SETTINGS = {
  enabled: true,
  showOnHomepage: true,
  eyebrow: 'Real Customer Stories',
  heading: 'Watch Real Customer',
  highlightText: 'Experiences',
  description: 'Read authentic wellness journeys and experiences shared by verified patrons across India.',
  trustText: 'Over 1,00,000+ happy verified customers across India',
  bgColor: '#fbf9f4',
  displayOrder: 4,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const MIGRATED_BASELINE_STORIES = [
  {
    id: 'story_migrated_1',
    customerName: 'Pooja Sharma',
    customerCity: 'Delhi',
    concern: 'Knee & Joint Pain',
    duration: '1:12',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    videoUrl: '',
    productTitle: 'Axe Ortho Pain Relief Syrup 200ml',
    productId: '100',
    productSlug: 'axe-ortho-syrup',
    productImage: '/uploads/axe-ortho-syurp.png',
    productPrice: 210,
    quote: 'Severe knee pain had stopped my morning walks. After 3 weeks of Axe Ortho, stiffness is gone!',
    showShopButton: true,
    order: 1,
    isActive: false,
    isDeleted: false,
    identityVerified: false,
    genuineFeedbackVerified: false,
    consentVerified: false,
    consentEvidence: '',
    medicalClaimPresent: true,
    complianceStatus: 'Pending',
    adminNotes: 'Migrated from legacy hardcoded homepage component. Unverified stock model photo and rapid pain relief claim. Requires genuine consent and compliant wording before publication.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story_migrated_2',
    customerName: 'Rohit Verma',
    customerCity: 'Jaipur',
    concern: 'Fatty Liver & Digestion',
    duration: '0:55',
    thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    videoUrl: '',
    productTitle: 'Livupchar Liver Detox Syrup',
    productId: '3413',
    productSlug: 'livupchar-ayurvedic-liver-care-syrup-200ml',
    productImage: '/uploads/livupchar.png',
    productPrice: 229,
    quote: 'Enzymes and SGPT levels normalized naturally. 100% natural and effective.',
    showShopButton: true,
    order: 2,
    isActive: false,
    isDeleted: false,
    identityVerified: false,
    genuineFeedbackVerified: false,
    consentVerified: false,
    consentEvidence: '',
    medicalClaimPresent: true,
    complianceStatus: 'Pending',
    adminNotes: 'Migrated from legacy hardcoded homepage component. Unverified stock photo and clinical SGPT normalization claim. Requires genuine consent and compliant wording before publication.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story_migrated_3',
    customerName: 'Meenakshi Iyer',
    customerCity: 'Bangalore',
    concern: 'Daily Digestion & Acidity',
    duration: '1:45',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    videoUrl: '',
    productTitle: 'Fp Enzyme Gut Syrup 200ml',
    productId: '3426',
    productSlug: 'fp-enzyme-syrup',
    productImage: '/uploads/fp-enzyme.png',
    productPrice: 150,
    quote: 'No more bloating or acidity after dinner. Fibax enzyme syrup worked wonders.',
    showShopButton: true,
    order: 3,
    isActive: false,
    isDeleted: false,
    identityVerified: false,
    genuineFeedbackVerified: false,
    consentVerified: false,
    consentEvidence: '',
    medicalClaimPresent: false,
    complianceStatus: 'Pending',
    adminNotes: 'Migrated from legacy hardcoded homepage component. Unverified stock photo. Requires genuine customer verification and consent before publication.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story_migrated_4',
    customerName: 'Sanjay Deshmukh',
    customerCity: 'Pune',
    concern: 'Blood Sugar Balance',
    duration: '1:05',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    videoUrl: '',
    productTitle: 'Diabdic Sugar Care Syrup',
    productId: '99',
    productSlug: 'diabdic-ayurvedic-syrup',
    productImage: '/uploads/diabdic-syurp.png',
    productPrice: 290,
    quote: 'My fasting sugar stabilized without synthetic pills. True Ayurvedic blessing.',
    showShopButton: true,
    order: 4,
    isActive: false,
    isDeleted: false,
    identityVerified: false,
    genuineFeedbackVerified: false,
    consentVerified: false,
    consentEvidence: '',
    medicalClaimPresent: true,
    complianceStatus: 'Pending',
    adminNotes: 'Migrated from legacy hardcoded homepage component. Unverified stock photo and prescription comparison. Requires genuine consent and compliant wording before publication.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story_migrated_5',
    customerName: 'Ananya Sen',
    customerCity: 'Kolkata',
    concern: 'Immunity & Stamina',
    duration: '1:20',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    videoUrl: '',
    productTitle: 'Fibax Ashwagandha Powder 100gm',
    productId: '3620',
    productSlug: 'fibax-ashwagandha-powder',
    productImage: '/uploads/fibax-ashwagandha-powder.jpg',
    productPrice: 230,
    quote: 'Noticeable boost in my daily energy levels and stress recovery. Highly recommend!',
    showShopButton: true,
    order: 5,
    isActive: false,
    isDeleted: false,
    identityVerified: false,
    genuineFeedbackVerified: false,
    consentVerified: false,
    consentEvidence: '',
    medicalClaimPresent: false,
    complianceStatus: 'Pending',
    adminNotes: 'Migrated from legacy hardcoded homepage component. Unverified stock photo. Requires genuine customer verification and consent before publication.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Strips script tags, HTML event handlers, and dangerous characters
 */
export function sanitizeText(val) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Loads customer stories store data with fallback
 */
export function getCustomerStoriesStore() {
  const data = getSingleton('customer_stories');
  if (!data || typeof data !== 'object') {
    const defaultData = {
      sectionSettings: { ...DEFAULT_SECTION_SETTINGS },
      stories: [...MIGRATED_BASELINE_STORIES]
    };
    setSingleton('customer_stories', defaultData);
    return defaultData;
  }

  // Normalize sectionSettings
  const settings = {
    ...DEFAULT_SECTION_SETTINGS,
    ...(data.sectionSettings || {})
  };

  // Normalize stories array
  const stories = Array.isArray(data.stories) ? data.stories : [...MIGRATED_BASELINE_STORIES];

  return { sectionSettings: settings, stories };
}

/**
 * Saves customer stories store data
 */
export function saveCustomerStoriesStore(storeData) {
  setSingleton('customer_stories', storeData);
  return storeData;
}

/**
 * Public accessor for storefront: returns only approved, active, non-deleted stories
 */
export function getPublicCustomerStories() {
  const store = getCustomerStoriesStore();
  const settings = store.sectionSettings;
  const isMasterEnabled = Boolean(settings.enabled && settings.showOnHomepage);

  if (!isMasterEnabled) {
    return {
      success: true,
      enabled: false,
      settings,
      stories: []
    };
  }

  // Strictly filter: active, approved compliance status, not deleted
  const approvedStories = store.stories
    .filter(s => s && !s.isDeleted && s.isActive && s.complianceStatus === 'Approved')
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

  return {
    success: true,
    enabled: true,
    settings,
    stories: approvedStories
  };
}

/**
 * Admin accessor: returns full section settings and all stories (including pending/rejected)
 */
export function getAdminCustomerStories() {
  const store = getCustomerStoriesStore();
  const nonDeleted = store.stories
    .filter(s => s && !s.isDeleted)
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

  return {
    success: true,
    settings: store.sectionSettings,
    stories: nonDeleted,
    stats: {
      total: nonDeleted.length,
      active: nonDeleted.filter(s => s.isActive).length,
      approved: nonDeleted.filter(s => s.complianceStatus === 'Approved').length,
      pending: nonDeleted.filter(s => s.complianceStatus === 'Pending').length,
      rejected: nonDeleted.filter(s => s.complianceStatus === 'Rejected').length
    }
  };
}

/**
 * Updates section settings
 */
export function updateSectionSettings(settingsUpdates, adminUser) {
  const store = getCustomerStoriesStore();
  const current = store.sectionSettings;

  const updatedSettings = {
    ...current,
    enabled: settingsUpdates.enabled !== undefined ? Boolean(settingsUpdates.enabled) : current.enabled,
    showOnHomepage: settingsUpdates.showOnHomepage !== undefined ? Boolean(settingsUpdates.showOnHomepage) : current.showOnHomepage,
    eyebrow: sanitizeText(settingsUpdates.eyebrow) || current.eyebrow,
    heading: sanitizeText(settingsUpdates.heading) || current.heading,
    highlightText: sanitizeText(settingsUpdates.highlightText) || current.highlightText,
    description: settingsUpdates.description !== undefined ? sanitizeText(settingsUpdates.description) : current.description,
    trustText: settingsUpdates.trustText !== undefined ? sanitizeText(settingsUpdates.trustText) : current.trustText,
    bgColor: settingsUpdates.bgColor?.trim() || current.bgColor,
    displayOrder: settingsUpdates.displayOrder !== undefined ? Number(settingsUpdates.displayOrder) : current.displayOrder,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.username || 'admin'
  };

  store.sectionSettings = updatedSettings;
  saveCustomerStoriesStore(store);
  return updatedSettings;
}

/**
 * Creates a new customer story card
 */
export function createStory(storyInput, adminUser) {
  const store = getCustomerStoriesStore();

  const customerName = sanitizeText(storyInput.customerName);
  const quote = sanitizeText(storyInput.quote);

  if (!customerName) {
    throw new Error('Customer name is required.');
  }
  if (!quote) {
    throw new Error('Testimonial feedback text is required.');
  }

  // Calculate highest order
  const existingOrders = store.stories.filter(s => !s.isDeleted).map(s => Number(s.order || 0));
  const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
  const targetOrder = storyInput.order !== undefined && storyInput.order !== null ? Number(storyInput.order) : maxOrder + 1;

  // Compliance safeguards
  const complianceStatus = ['Pending', 'Approved', 'Rejected'].includes(storyInput.complianceStatus)
    ? storyInput.complianceStatus
    : 'Pending';

  const identityVerified = Boolean(storyInput.identityVerified);
  const genuineFeedbackVerified = Boolean(storyInput.genuineFeedbackVerified);
  const consentVerified = Boolean(storyInput.consentVerified);

  // Guard: Cannot mark Approved without verification
  if (complianceStatus === 'Approved') {
    if (!identityVerified || !genuineFeedbackVerified || !consentVerified) {
      throw new Error('Cannot set Compliance Status to Approved without verifying Identity, Feedback, and Customer Consent.');
    }
  }

  const newStory = {
    id: 'story_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    customerName,
    customerCity: sanitizeText(storyInput.customerCity) || 'India',
    concern: sanitizeText(storyInput.concern) || 'General Wellness',
    duration: sanitizeText(storyInput.duration) || '',
    thumbnail: storyInput.thumbnail?.trim() || '',
    videoUrl: storyInput.videoUrl?.trim() || '',
    productTitle: sanitizeText(storyInput.productTitle) || 'Ayurvedic Formulation',
    productId: storyInput.productId ? String(storyInput.productId).trim() : '',
    productSlug: storyInput.productSlug?.trim() || '',
    productImage: storyInput.productImage?.trim() || '',
    productPrice: storyInput.productPrice !== undefined && storyInput.productPrice !== null ? Number(storyInput.productPrice) : 0,
    quote,
    showShopButton: storyInput.showShopButton !== undefined ? Boolean(storyInput.showShopButton) : true,
    order: targetOrder,
    isActive: storyInput.isActive !== undefined ? Boolean(storyInput.isActive) : false,
    isDeleted: false,

    // Verification and compliance controls
    identityVerified,
    genuineFeedbackVerified,
    consentVerified,
    consentEvidence: sanitizeText(storyInput.consentEvidence) || '',
    medicalClaimPresent: Boolean(storyInput.medicalClaimPresent),
    complianceStatus,
    adminNotes: sanitizeText(storyInput.adminNotes) || '',

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: adminUser?.username || 'admin',
    updatedBy: adminUser?.username || 'admin'
  };

  store.stories.push(newStory);
  saveCustomerStoriesStore(store);
  return newStory;
}

/**
 * Updates an existing customer story card
 */
export function updateStory(storyId, updates, adminUser) {
  const store = getCustomerStoriesStore();
  const index = store.stories.findIndex(s => s.id === storyId && !s.isDeleted);

  if (index === -1) {
    throw new Error('Customer story not found.');
  }

  const current = store.stories[index];

  // Compliance safeguards
  let complianceStatus = current.complianceStatus;
  if (updates.complianceStatus && ['Pending', 'Approved', 'Rejected'].includes(updates.complianceStatus)) {
    complianceStatus = updates.complianceStatus;
  }

  const identityVerified = updates.identityVerified !== undefined
    ? Boolean(updates.identityVerified)
    : current.identityVerified;

  const genuineFeedbackVerified = updates.genuineFeedbackVerified !== undefined
    ? Boolean(updates.genuineFeedbackVerified)
    : current.genuineFeedbackVerified;

  const consentVerified = updates.consentVerified !== undefined
    ? Boolean(updates.consentVerified)
    : current.consentVerified;

  if (complianceStatus === 'Approved') {
    if (!identityVerified || !genuineFeedbackVerified || !consentVerified) {
      throw new Error('Cannot set Compliance Status to Approved without verifying Identity, Feedback, and Customer Consent.');
    }
  }

  const updatedStory = {
    ...current,
    customerName: updates.customerName !== undefined ? sanitizeText(updates.customerName) : current.customerName,
    customerCity: updates.customerCity !== undefined ? sanitizeText(updates.customerCity) : current.customerCity,
    concern: updates.concern !== undefined ? sanitizeText(updates.concern) : current.concern,
    duration: updates.duration !== undefined ? sanitizeText(updates.duration) : current.duration,
    thumbnail: updates.thumbnail !== undefined ? updates.thumbnail.trim() : current.thumbnail,
    videoUrl: updates.videoUrl !== undefined ? updates.videoUrl.trim() : current.videoUrl,
    productTitle: updates.productTitle !== undefined ? sanitizeText(updates.productTitle) : current.productTitle,
    productId: updates.productId !== undefined ? String(updates.productId).trim() : current.productId,
    productSlug: updates.productSlug !== undefined ? updates.productSlug.trim() : current.productSlug,
    productImage: updates.productImage !== undefined ? updates.productImage.trim() : current.productImage,
    productPrice: updates.productPrice !== undefined ? Number(updates.productPrice) : current.productPrice,
    quote: updates.quote !== undefined ? sanitizeText(updates.quote) : current.quote,
    showShopButton: updates.showShopButton !== undefined ? Boolean(updates.showShopButton) : current.showShopButton,
    order: updates.order !== undefined ? Number(updates.order) : current.order,
    isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : current.isActive,

    identityVerified,
    genuineFeedbackVerified,
    consentVerified,
    consentEvidence: updates.consentEvidence !== undefined ? sanitizeText(updates.consentEvidence) : current.consentEvidence,
    medicalClaimPresent: updates.medicalClaimPresent !== undefined ? Boolean(updates.medicalClaimPresent) : current.medicalClaimPresent,
    complianceStatus,
    adminNotes: updates.adminNotes !== undefined ? sanitizeText(updates.adminNotes) : current.adminNotes,

    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.username || 'admin'
  };

  store.stories[index] = updatedStory;
  saveCustomerStoriesStore(store);
  return updatedStory;
}

/**
 * Soft deletes a customer story card
 */
export function deleteStory(storyId, adminUser) {
  const store = getCustomerStoriesStore();
  const index = store.stories.findIndex(s => s.id === storyId && !s.isDeleted);

  if (index === -1) {
    throw new Error('Customer story not found.');
  }

  store.stories[index].isDeleted = true;
  store.stories[index].isActive = false;
  store.stories[index].updatedAt = new Date().toISOString();
  store.stories[index].updatedBy = adminUser?.username || 'admin';

  saveCustomerStoriesStore(store);
  return { success: true, deletedId: storyId };
}

/**
 * Reorders customer stories by accepting an ordered array of IDs
 */
export function reorderStories(storyIds, adminUser) {
  if (!Array.isArray(storyIds)) {
    throw new Error('storyIds must be an array of IDs.');
  }

  const store = getCustomerStoriesStore();
  const idToOrder = {};
  storyIds.forEach((id, idx) => {
    idToOrder[id] = idx + 1;
  });

  store.stories.forEach(story => {
    if (idToOrder[story.id] !== undefined) {
      story.order = idToOrder[story.id];
      story.updatedAt = new Date().toISOString();
      story.updatedBy = adminUser?.username || 'admin';
    }
  });

  saveCustomerStoriesStore(store);
  return getAdminCustomerStories();
}
