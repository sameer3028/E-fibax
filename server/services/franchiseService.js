import { getArray, setArray, getSingleton, setSingleton } from '../store.js';
import { normalizeIndianMobileNumber, isValidIndianMobileNumber } from './userService.js';
import { createTransporter, isSmtpConfigured, readEmailConfig, logEmailExecution } from './emailService.js';
import { generateFranchiseAdminAlertHtml, generateFranchiseAdminAlertText } from '../emailTemplates/franchiseAdminAlert.js';
import { generateFranchiseCustomerConfirmationHtml, generateFranchiseCustomerConfirmationText } from '../emailTemplates/franchiseCustomerConfirmation.js';

// Fallback CMS configuration if storage is not yet populated
export function getDefaultFranchisePublishedConfig() {
  return {
    isActive: true,
    desktopVisible: true,
    mobileVisible: true,
    pageContent: {
      heading: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
      subtitle: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
      description: 'Fibax Ayurveda is a premier Ayurvedic and herbal pharmaceutical company providing verified PCD Pharma Franchise business opportunities across India.',
      sectionHeadings: {
        whyChoose: 'Why Choose Fibax Ayurveda?',
        whyChooseSubtitle: 'Key business advantages of partnering with our growing Ayurvedic PCD franchise network.',
        portfolio: 'Diverse Ayurvedic Formulations',
        portfolioSubtitle: 'Explore our certified remedies tailored for high patient satisfaction and repeat distribution.',
        process: '5 Simple Steps to Launch Your PCD Franchise',
        processSubtitle: 'Transparent, structured, and compliant partnership onboarding from enquiry to stock dispatch.',
        audience: 'Who Can Partner With Us?',
        audienceSubtitle: 'Our franchise model is designed for experienced healthcare professionals and ambitious entrepreneurs.',
        form: 'Apply for Ayurvedic PCD Pharma Franchise',
        formSubtitle: 'Submit your territory requirements and our institutional sales desk will connect with you within 24 hours.',
        faqs: 'Frequently Asked Questions',
        faqsSubtitle: 'Clear answers to the most common queries about our Ayurvedic PCD franchise model and terms.'
      },
      ctaButtons: {
        primaryLabel: 'Apply for Franchise',
        primaryDestination: '#franchise-form',
        secondaryLabel: 'WhatsApp Enquiry',
        secondaryDestination: 'https://wa.me/918872544458'
      },
      contactInfo: {
        helplineNumber: '+91 88725 44458',
        whatsappNumber: '918872544458',
        email: 'info@fibaxpharma.com',
        adminNotificationEmail: 'fibaxpharma@gmail.com'
      }
    },
    banner: {
      enabled: true,
      badge: 'WHO-GMP & AYUSH PREMIUM QUALITY ASSURED',
      heading: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
      subtitle: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
      desktopImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80',
      mobileImage: '',
      primaryCtaText: 'Apply for Franchise',
      primaryCtaLink: '#franchise-form',
      secondaryCtaText: 'WhatsApp Enquiry',
      secondaryCtaLink: 'https://wa.me/918872544458'
    },
    benefits: [
      {
        id: 'ben_1',
        title: 'Wide Ayurvedic Product Portfolio',
        description: 'Access 250+ clinically standardized Ayurvedic formulations across classical syrups, oils, capsules, churnas, and vati.',
        icon: 'Package',
        enabled: true,
        order: 1
      },
      {
        id: 'ben_2',
        title: 'Marketing and Promotional Support',
        description: 'Receive comprehensive marketing literature, visual aids, MR bags, visiting cards, catch covers, and product glossaries.',
        icon: 'Sparkles',
        enabled: true,
        order: 2
      },
      {
        id: 'ben_3',
        title: 'Product and Packaging Information',
        description: 'Premium alu-alu and blister packaging with tamper-proof seals, transparent herbal compositions, and batch lab test certificates.',
        icon: 'ShieldCheck',
        enabled: true,
        order: 3
      },
      {
        id: 'ben_4',
        title: 'Business Enquiry Assistance',
        description: 'Prompt quotations, dedicated relationship executives, transparent billing, and dedicated assistance for all commercial queries.',
        icon: 'Headphones',
        enabled: true,
        order: 4
      },
      {
        id: 'ben_5',
        title: 'Territory-Based Franchise Opportunities',
        description: 'Mutually agreed district and territory distribution partnerships ensuring focused local market growth without channel conflict.',
        icon: 'MapPin',
        enabled: true,
        order: 5
      },
      {
        id: 'ben_6',
        title: 'Dedicated Business Communication',
        description: 'Reliable dispatch tracking via Delhivery, structured dispatch timelines, and regular pipeline updates directly from headquarters.',
        icon: 'Truck',
        enabled: true,
        order: 6
      }
    ],
    productCategories: [
      { id: 'cat_capsules', name: 'Ayurvedic Capsules', slug: 'capsules', icon: 'Pill', enabled: true, order: 1, description: 'Standardized extract capsules in premium blister packaging.' },
      { id: 'cat_syrups', name: 'Herbal Syrups', slug: 'syrups', icon: 'FlaskConical', enabled: true, order: 2, description: 'Classical Ayurvedic kwath syrups for cough, liver, and digestion.' },
      { id: 'cat_tablets', name: 'Tablets', slug: 'tablets', icon: 'Layers', enabled: true, order: 3, description: 'Purified classical herbal vati and ghana tablets.' },
      { id: 'cat_powders', name: 'Herbal Powders', slug: 'powders', icon: 'Sparkles', enabled: true, order: 4, description: 'Single-herb and compound Ayurvedic churnas.' },
      { id: 'cat_oils', name: 'Ayurvedic Oils', slug: 'oils', icon: 'Droplet', enabled: true, order: 5, description: 'Medicated taila and pain relief oils formulated via authentic tel pak vidhi.' },
      { id: 'cat_nutra', name: 'Herbal and Nutraceutical Products', slug: 'nutraceuticals', icon: 'Heart', enabled: true, order: 6, description: 'Modern botanical wellness blends and vitality boosters.' }
    ],
    processSteps: [
      { step: 1, id: 'step_1', title: 'Submit Franchise Enquiry', description: 'Fill the quick franchise enquiry form with your contact details, target territory, and background.', enabled: true },
      { step: 2, id: 'step_2', title: 'Our Team Contacts You', description: 'Our senior business development manager reviews your application and reaches out within 24-48 business hours.', enabled: true },
      { step: 3, id: 'step_3', title: 'Territory & Business Discussion', description: 'We discuss available territory rights, product margins, quotation terms, and order minimums tailored to your district.', enabled: true },
      { step: 4, id: 'step_4', title: 'Documentation & Verification', description: 'Submit basic KYC, GSTIN, and relevant business registrations to establish authorized distribution credentials.', enabled: true },
      { step: 5, id: 'step_5', title: 'Franchise Approval & Onboarding', description: 'Receive official franchise approval, promotional starter kit, marketing collateral, and first stock dispatch.', enabled: true }
    ],
    targetAudience: [
      { id: 'aud_1', title: 'Pharma Distributors', description: 'Established distribution firms aiming to expand their portfolio with proven, high-demand Ayurvedic lines.' },
      { id: 'aud_2', title: 'Medical Representatives', description: 'Experienced pharma professionals seeking to transition into independent entrepreneurship with company backing.' },
      { id: 'aud_3', title: 'Pharma Wholesalers', description: 'Stockists and wholesale medicine traders looking for competitive trade discounts and reliable supply chains.' },
      { id: 'aud_4', title: 'Ayurvedic Product Retailers', description: 'Retail pharmacies, chemists, and Ayurvedic clinics wishing to stock authentic classical remedies.' },
      { id: 'aud_5', title: 'New Business Entrepreneurs', description: 'Aspiring entrepreneurs entering India\'s high-growth herbal healthcare and botanical wellness ecosystem.' }
    ],
    faqs: [
      { id: 'faq_1', question: 'What is an Ayurvedic PCD Pharma Franchise?', answer: 'Propaganda Cum Distribution (PCD) is a business model where Fibax Ayurveda grants marketing and distribution rights to a franchise partner for a defined geographic territory, backed by promotional materials and consistent product supply.', enabled: true, order: 1 },
      { id: 'faq_2', question: 'Who can apply for a Fibax Ayurveda franchise?', answer: 'We welcome pharmaceutical distributors, experienced medical representatives, wholesalers, retail chemists, and aspiring healthcare entrepreneurs looking to build a sustainable business with authentic Ayurvedic remedies.', enabled: true, order: 2 },
      { id: 'faq_3', question: 'How is a territory allocated?', answer: 'Territories are allocated based on mutual commercial agreement, district vacancy, and existing distribution channels to prevent market cannibalization and protect your commercial efforts.', enabled: true, order: 3 },
      { id: 'faq_4', question: 'What documents are required?', answer: 'Basic identification (PAN and Aadhaar), GST registration certificate (if applicable), and existing business documentation. For proprietary Ayurvedic OTC products, our team will guide you on the simple regulatory requirements.', enabled: true, order: 4 },
      { id: 'faq_5', question: 'How can I enquire about the product range and price list?', answer: 'Submit the franchise enquiry form on this page or message our WhatsApp business helpline. Our team will share the complete Ayurvedic product catalogue, net dealer price list, and profit margins.', enabled: true, order: 5 },
      { id: 'faq_6', question: 'How does the franchise onboarding process work?', answer: 'Once your enquiry is verified and terms are agreed upon, we process your initial inventory order, prepare your marketing starter kit (visual aids, product literature), and dispatch via our express courier partner.', enabled: true, order: 6 }
    ],
    formSettings: {
      heading: 'Apply for Ayurvedic PCD Pharma Franchise',
      description: 'Submit your territory requirements and our institutional sales desk will connect with you within 24 hours.',
      businessTypes: [
        'Pharma Distributor',
        'Medical Representative',
        'Pharma Wholesaler / Stockist',
        'Retail Chemist / Pharmacy Owner',
        'New Business Entrepreneur',
        'Other Healthcare Professional'
      ],
      experienceOptions: [
        'None / Fresher',
        'Less than 2 years',
        '2 to 5 years',
        '5 to 10 years',
        '10+ years'
      ],
      investmentRanges: [
        '₹25,000 - ₹50,000',
        '₹50,000 - ₹1,00,000',
        '₹1,00,000 - ₹2,50,000',
        '₹2,50,000 - ₹5,00,000',
        '₹5,00,000+'
      ],
      consentText: 'I agree to be contacted by Fibax Ayurveda regarding my franchise enquiry and accept the Privacy Policy.',
      submitButtonText: 'Submit Franchise Enquiry',
      successTitle: 'Application Received',
      successMessage: 'Your PCD Pharma Franchise application has been registered with our institutional sales team.',
      adminNotificationEmail: 'fibaxpharma@gmail.com',
      fieldSettings: {
        name: { required: true, locked: true, label: 'Full Name' },
        phone: { required: true, locked: true, label: 'Mobile Number' },
        consent: { required: true, locked: true, label: 'Consent Agreement' },
        email: { required: true, label: 'Email Address' },
        state: { required: true, label: 'Target State' },
        city: { required: true, label: 'District / City' },
        businessType: { required: false, label: 'Business Profile' },
        experience: { required: false, label: 'Pharma Experience' },
        investmentRange: { required: false, label: 'Investment Range' },
        message: { required: false, label: 'Additional Requirements' }
      }
    },
    seo: {
      title: 'Ayurvedic PCD Pharma Franchise | Fibax Ayurveda',
      metaDescription: 'Explore PCD Pharma Franchise opportunities with Fibax Ayurveda. High-margin Ayurvedic remedies, monopoly marketing support, and fast dispatch across India.',
      canonicalUrl: 'https://www.fibaxpharma.com/pcd-pharma-franchise',
      ogTitle: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
      ogDescription: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
      ogImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80'
    },
    publishedAt: new Date().toISOString(),
    publishedBy: 'system'
  };
}

// Backwards-compatible format mapper
export function formatFranchiseConfigResponse(config) {
  if (!config || typeof config !== 'object') {
    return getDefaultFranchisePublishedConfig();
  }

  const base = { ...config };

  // Backwards-compatible aliases for legacy readers & tests:
  base.hero = {
    badge: base.banner?.badge || 'WHO-GMP & AYUSH PREMIUM QUALITY ASSURED',
    heading: base.pageContent?.heading || base.banner?.heading || base.hero?.heading || 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
    subtitle: base.pageContent?.subtitle || base.banner?.subtitle || base.hero?.subtitle || 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
    bannerImage: base.banner?.desktopImage || base.hero?.bannerImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80',
    primaryCta: base.pageContent?.ctaButtons?.primaryLabel || base.hero?.primaryCta || 'Apply for Franchise',
    secondaryCta: base.pageContent?.ctaButtons?.secondaryLabel || base.hero?.secondaryCta || 'WhatsApp Enquiry',
    whatsappNumber: base.pageContent?.contactInfo?.whatsappNumber || base.hero?.whatsappNumber || '918872544458',
    helplineNumber: base.pageContent?.contactInfo?.helplineNumber || base.hero?.helplineNumber || '+91 88725 44458'
  };

  base.benefits = Array.isArray(base.benefits) ? base.benefits : [];
  base.portfolioCategories = Array.isArray(base.productCategories) ? base.productCategories : (Array.isArray(base.portfolioCategories) ? base.portfolioCategories : []);
  base.productCategories = base.portfolioCategories;
  base.processSteps = Array.isArray(base.processSteps) ? base.processSteps : [];
  base.targetAudience = Array.isArray(base.targetAudience) ? base.targetAudience : [];
  base.faqs = Array.isArray(base.faqs) ? base.faqs : [];

  base.formConfig = {
    businessTypes: base.formSettings?.businessTypes || base.formConfig?.businessTypes || [],
    experienceOptions: base.formSettings?.experienceOptions || base.formConfig?.experienceOptions || [],
    investmentRanges: base.formSettings?.investmentRanges || base.formConfig?.investmentRanges || []
  };

  base.contact = {
    phone: base.pageContent?.contactInfo?.helplineNumber || base.contact?.phone || '+91 88725 44458',
    whatsapp: base.pageContent?.contactInfo?.whatsappNumber || base.contact?.whatsapp || '918872544458',
    email: base.pageContent?.contactInfo?.email || base.contact?.email || 'info@fibaxpharma.com',
    adminNotificationEmail: base.formSettings?.adminNotificationEmail || base.contact?.adminNotificationEmail || 'fibaxpharma@gmail.com'
  };

  return base;
}

export function getDefaultFranchiseCmsConfig() {
  return formatFranchiseConfigResponse(getDefaultFranchisePublishedConfig());
}

// Retrieves the full CMS storage object including published, draft, and change history
export function getFranchiseCmsFull() {
  let stored = getSingleton('franchise_page_cms');

  if (!stored || typeof stored !== 'object') {
    stored = {
      published: getDefaultFranchisePublishedConfig(),
      draft: null,
      history: [
        {
          id: 'hist_initial',
          action: 'published',
          timestamp: new Date().toISOString(),
          adminUser: 'system',
          summary: 'Baseline PCD franchise configuration published'
        }
      ]
    };
    setSingleton('franchise_page_cms', stored);
  }

  // Handle legacy flat object in storage
  if (!stored.published && stored.hero) {
    const defaultFull = getDefaultFranchisePublishedConfig();
    const migratedPublished = {
      ...defaultFull,
      isActive: stored.isActive !== undefined ? stored.isActive : true,
      desktopVisible: stored.desktopVisible !== undefined ? stored.desktopVisible : true,
      mobileVisible: stored.mobileVisible !== undefined ? stored.mobileVisible : true,
      pageContent: {
        ...defaultFull.pageContent,
        heading: stored.hero?.heading || defaultFull.pageContent.heading,
        subtitle: stored.hero?.subtitle || defaultFull.pageContent.subtitle
      },
      banner: {
        ...defaultFull.banner,
        heading: stored.hero?.heading || defaultFull.banner.heading,
        subtitle: stored.hero?.subtitle || defaultFull.banner.subtitle,
        desktopImage: stored.hero?.bannerImage || defaultFull.banner.desktopImage
      },
      benefits: stored.benefits || defaultFull.benefits,
      productCategories: stored.portfolioCategories || defaultFull.productCategories,
      processSteps: stored.processSteps || defaultFull.processSteps,
      faqs: stored.faqs || defaultFull.faqs,
      publishedAt: stored.updatedAt || new Date().toISOString(),
      publishedBy: stored.lastModifiedBy || 'admin'
    };

    stored = {
      published: migratedPublished,
      draft: JSON.parse(JSON.stringify(migratedPublished)),
      history: [
        {
          id: 'hist_migrated',
          action: 'published',
          timestamp: new Date().toISOString(),
          adminUser: 'system',
          summary: 'Migrated legacy franchise configuration to Draft/Publish CMS'
        }
      ]
    };
    setSingleton('franchise_page_cms', stored);
  }

  // Ensure published has all default fields
  const fullPublished = {
    ...getDefaultFranchisePublishedConfig(),
    ...(stored.published || {})
  };

  // Ensure draft exists
  const fullDraft = stored.draft
    ? { ...fullPublished, ...stored.draft }
    : JSON.parse(JSON.stringify(fullPublished));

  const history = Array.isArray(stored.history) ? stored.history : [];

  // Check if draft has unpublished changes
  const isDraftDirty = JSON.stringify(fullDraft) !== JSON.stringify(fullPublished);

  return {
    published: fullPublished,
    draft: fullDraft,
    history,
    isDraftDirty
  };
}

// Public or Admin reader for active configuration
export function getFranchiseCmsConfig(mode = 'published') {
  const full = getFranchiseCmsFull();
  const source = mode === 'draft' ? full.draft : full.published;
  return formatFranchiseConfigResponse(source);
}

// Saves a new draft to persistent storage without affecting the live website
export function saveFranchiseCmsDraft(draftUpdates, adminUser = 'admin') {
  const full = getFranchiseCmsFull();
  const updatedDraft = {
    ...full.draft,
    ...draftUpdates,
    savedAt: new Date().toISOString(),
    savedBy: adminUser
  };

  // If hero is passed in legacy format, map it into pageContent and banner
  if (draftUpdates.hero) {
    if (draftUpdates.hero.heading) {
      updatedDraft.pageContent = {
        ...(updatedDraft.pageContent || {}),
        heading: draftUpdates.hero.heading
      };
      updatedDraft.banner = {
        ...(updatedDraft.banner || {}),
        heading: draftUpdates.hero.heading
      };
    }
    if (draftUpdates.hero.subtitle) {
      updatedDraft.pageContent = {
        ...(updatedDraft.pageContent || {}),
        subtitle: draftUpdates.hero.subtitle
      };
      updatedDraft.banner = {
        ...(updatedDraft.banner || {}),
        subtitle: draftUpdates.hero.subtitle
      };
    }
    if (draftUpdates.hero.bannerImage) {
      updatedDraft.banner = {
        ...(updatedDraft.banner || {}),
        desktopImage: draftUpdates.hero.bannerImage
      };
    }
  }

  const newHistoryItem = {
    id: `hist_${Date.now()}`,
    action: 'draft_saved',
    timestamp: new Date().toISOString(),
    adminUser,
    summary: 'Draft configuration updated'
  };

  const updatedHistory = [newHistoryItem, ...full.history].slice(0, 30);

  const newStored = {
    published: full.published,
    draft: updatedDraft,
    history: updatedHistory
  };

  setSingleton('franchise_page_cms', newStored);

  return {
    success: true,
    draft: formatFranchiseConfigResponse(updatedDraft),
    history: updatedHistory,
    isDraftDirty: true
  };
}

// Publishes the current draft to the live production website
export function publishFranchiseCms(adminUser = 'admin', summary = 'Published changes to live website') {
  const full = getFranchiseCmsFull();

  const now = new Date().toISOString();
  const newPublished = {
    ...full.draft,
    publishedAt: now,
    publishedBy: adminUser
  };

  const newDraft = JSON.parse(JSON.stringify(newPublished));

  const newHistoryItem = {
    id: `hist_${Date.now()}`,
    action: 'published',
    timestamp: now,
    adminUser,
    summary: summary || 'Published changes to live website'
  };

  const updatedHistory = [newHistoryItem, ...full.history].slice(0, 30);

  const newStored = {
    published: newPublished,
    draft: newDraft,
    history: updatedHistory
  };

  setSingleton('franchise_page_cms', newStored);

  return {
    success: true,
    published: formatFranchiseConfigResponse(newPublished),
    draft: formatFranchiseConfigResponse(newDraft),
    history: updatedHistory,
    isDraftDirty: false
  };
}

// Discards draft changes and restores draft from currently published state
export function revertFranchiseCmsDraft(adminUser = 'admin') {
  const full = getFranchiseCmsFull();
  const restoredDraft = JSON.parse(JSON.stringify(full.published));
  restoredDraft.savedAt = new Date().toISOString();
  restoredDraft.savedBy = adminUser;

  const newHistoryItem = {
    id: `hist_${Date.now()}`,
    action: 'draft_reverted',
    timestamp: new Date().toISOString(),
    adminUser,
    summary: 'Draft changes discarded and reset to published state'
  };

  const updatedHistory = [newHistoryItem, ...full.history].slice(0, 30);

  const newStored = {
    published: full.published,
    draft: restoredDraft,
    history: updatedHistory
  };

  setSingleton('franchise_page_cms', newStored);

  return {
    success: true,
    draft: formatFranchiseConfigResponse(restoredDraft),
    history: updatedHistory,
    isDraftDirty: false
  };
}

// Backwards-compatible legacy updater that updates both published & draft immediately
export function updateFranchiseCmsConfig(updates, adminUser = 'admin') {
  saveFranchiseCmsDraft(updates, adminUser);
  const publishedRes = publishFranchiseCms(adminUser, 'Direct update via legacy API');
  return publishedRes.published;
}

// Generate unique lead reference ID
export function generateLeadId() {
  const prefix = 'FBX-PCD-';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}-${random}`;
}

// Validate and process new franchise enquiry
export async function submitFranchiseLead(inputData, clientIp = '127.0.0.1') {
  const {
    name,
    phone,
    whatsapp,
    sameAsMobile,
    email,
    state,
    city,
    businessType,
    experience,
    investmentRange,
    message,
    consent
  } = inputData || {};

  // 1. Mandatory Consent Check
  if (!consent) {
    return {
      success: false,
      error: 'You must agree to be contacted by Fibax Ayurveda and accept the Privacy Policy to submit an enquiry.'
    };
  }

  // 2. Validate Full Name
  const cleanName = String(name || '').replace(/[<>]/g, '').trim();
  if (!cleanName || cleanName.length < 2) {
    return {
      success: false,
      error: 'Please enter a valid full name (minimum 2 characters).'
    };
  }

  // 3. Validate Mobile Number
  const standardPhone = normalizeIndianMobileNumber(phone);
  if (!standardPhone || !isValidIndianMobileNumber(standardPhone)) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  // 4. Validate WhatsApp Number
  let standardWhatsapp = standardPhone;
  if (!sameAsMobile && whatsapp && String(whatsapp).trim()) {
    const cleanWa = normalizeIndianMobileNumber(whatsapp);
    if (cleanWa && isValidIndianMobileNumber(cleanWa)) {
      standardWhatsapp = cleanWa;
    }
  }

  // 5. Validate Email Address
  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      success: false,
      error: 'Please enter a valid email address.'
    };
  }

  // 6. Validate State & City
  const cleanState = String(state || '').replace(/[<>]/g, '').trim();
  const cleanCity = String(city || '').replace(/[<>]/g, '').trim();
  if (!cleanState) {
    return {
      success: false,
      error: 'Please select your target State.'
    };
  }
  if (!cleanCity || cleanCity.length < 2) {
    return {
      success: false,
      error: 'Please enter your District / City.'
    };
  }

  // 7. Sanitize optional fields
  const cleanBusinessType = String(businessType || 'Other Healthcare Professional').replace(/[<>]/g, '').trim();
  const cleanExperience = String(experience || 'None / Fresher').replace(/[<>]/g, '').trim();
  const cleanInvestment = String(investmentRange || '₹50,000 - ₹1,00,000').replace(/[<>]/g, '').trim();
  const cleanMessage = String(message || '').replace(/[<>]/g, '').trim();

  // 8. Anti-Spam / Rate-limiting Check (prevent exact duplicate within 10 minutes)
  const leads = getArray('franchise_leads');
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const recentDuplicate = leads.find((l) => {
    const isSamePhone = l.phone === standardPhone;
    const isSameEmail = l.email === cleanEmail;
    const isRecent = new Date(l.createdAt).getTime() > tenMinutesAgo;
    return (isSamePhone || isSameEmail) && isRecent;
  });

  if (recentDuplicate) {
    return {
      success: true,
      isDuplicate: true,
      message: 'Your franchise enquiry was recently received. Our team will contact you shortly.',
      leadId: recentDuplicate.id,
      lead: sanitizeLead(recentDuplicate)
    };
  }

  // 9. Construct canonical lead document
  const leadId = generateLeadId();
  const nowIso = new Date().toISOString();

  const newLead = {
    id: leadId,
    name: cleanName,
    phone: standardPhone,
    whatsapp: standardWhatsapp,
    email: cleanEmail,
    state: cleanState,
    city: cleanCity,
    businessType: cleanBusinessType,
    experience: cleanExperience,
    investmentRange: cleanInvestment,
    message: cleanMessage,
    consent: true,
    consentTimestamp: nowIso,
    status: 'New', // 'New' | 'Contacted' | 'Interested' | 'Follow-up Required' | 'Converted' | 'Rejected'
    assignedStaff: 'Unassigned',
    followUpDate: null,
    internalNotes: [
      {
        id: 'note_' + Date.now(),
        author: 'System',
        text: `Enquiry submitted from IP ${clientIp} for ${cleanCity}, ${cleanState}`,
        timestamp: nowIso
      }
    ],
    adminNotificationStatus: 'Pending',
    customerNotificationStatus: 'Pending',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  // 10. Persist immediately into storage
  leads.unshift(newLead);
  setArray('franchise_leads', leads);
  console.log(`📋 New Franchise Lead registered: ${newLead.id} - ${newLead.name} (${newLead.phone})`);

  // 11. Async Notification Dispatch (safe error boundary)
  dispatchFranchiseNotifications(newLead).catch((err) => {
    console.error('Franchise notification error:', err.message);
  });

  return {
    success: true,
    message: 'Franchise enquiry submitted successfully! Our business development team will contact you within 24-48 hours.',
    leadId: newLead.id,
    lead: sanitizeLead(newLead)
  };
}

// Background notification dispatcher
async function dispatchFranchiseNotifications(lead) {
  const config = readEmailConfig();
  const cmsConfig = getFranchiseCmsConfig();
  const adminEmail = (cmsConfig.contact?.adminNotificationEmail || config.adminAlertEmail || 'fibaxpharma@gmail.com').trim();
  const senderName = config.senderName || 'Fibax Ayurveda';
  const senderEmail = config.senderEmail || 'info@fibaxpharma.com';
  const replyTo = config.replyToEmail || 'care@fibaxpharma.com';

  const isConfigured = isSmtpConfigured(config);
  let adminStatus = isConfigured ? 'Pending' : 'Not Configured';
  let customerStatus = isConfigured ? 'Pending' : 'Not Configured';

  try {
    const transporter = await createTransporter(config);

    // 1. Send Admin Alert Email
    try {
      const adminMailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: adminEmail,
        replyTo: lead.email,
        subject: `New PCD Pharma Franchise Enquiry: ${lead.id} - ${lead.name} (${lead.state})`,
        html: generateFranchiseAdminAlertHtml(lead),
        text: generateFranchiseAdminAlertText(lead)
      };

      const info = await transporter.sendMail(adminMailOptions);
      adminStatus = isConfigured ? 'Sent' : 'Mock Delivered (Dev)';
      logEmailExecution({
        type: 'FRANCHISE_ADMIN_ALERT',
        leadId: lead.id,
        recipient: adminEmail,
        status: adminStatus,
        messageId: info.messageId || null
      });
      console.log(`✉️ Franchise Admin Alert sent to ${adminEmail} for lead ${lead.id}`);
    } catch (adminErr) {
      adminStatus = 'Failed: ' + adminErr.message;
      logEmailExecution({
        type: 'FRANCHISE_ADMIN_ALERT',
        leadId: lead.id,
        recipient: adminEmail,
        status: 'Failed',
        error: adminErr.message
      });
      console.error(`❌ Franchise Admin Alert failed for ${lead.id}:`, adminErr.message);
    }

    // 2. Send Customer Confirmation Email
    try {
      const customerMailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: lead.email,
        replyTo,
        subject: `Thank you for your Franchise Enquiry with Fibax Ayurveda [${lead.id}]`,
        html: generateFranchiseCustomerConfirmationHtml(lead),
        text: generateFranchiseCustomerConfirmationText(lead)
      };

      const custInfo = await transporter.sendMail(customerMailOptions);
      customerStatus = isConfigured ? 'Sent' : 'Mock Delivered (Dev)';
      logEmailExecution({
        type: 'FRANCHISE_CUSTOMER_CONFIRMATION',
        leadId: lead.id,
        recipient: lead.email,
        status: customerStatus,
        messageId: custInfo.messageId || null
      });
      console.log(`✉️ Franchise Customer Confirmation sent to ${lead.email} for lead ${lead.id}`);
    } catch (custErr) {
      customerStatus = 'Failed: ' + custErr.message;
      logEmailExecution({
        type: 'FRANCHISE_CUSTOMER_CONFIRMATION',
        leadId: lead.id,
        recipient: lead.email,
        status: 'Failed',
        error: custErr.message
      });
      console.error(`❌ Franchise Customer Confirmation failed for ${lead.id}:`, custErr.message);
    }
  } catch (outerErr) {
    console.error('Transporter setup failure in franchise notifications:', outerErr.message);
  }

  // Update lead notification status in storage
  try {
    const leads = getArray('franchise_leads');
    const idx = leads.findIndex((l) => l.id === lead.id);
    if (idx !== -1) {
      leads[idx].adminNotificationStatus = adminStatus;
      leads[idx].customerNotificationStatus = customerStatus;
      leads[idx].updatedAt = new Date().toISOString();
      setArray('franchise_leads', leads);
    }
  } catch (updateErr) {
    console.error('Failed to update lead notification statuses:', updateErr.message);
  }
}

// Query leads with search, filters, pagination and stats
export function queryFranchiseLeads(query = {}) {
  const leads = getArray('franchise_leads');
  const {
    search = '',
    status = 'all',
    state = 'all',
    dateRange = 'all'
  } = query;

  const searchLower = String(search).trim().toLowerCase();

  // Date threshold computation
  let dateThreshold = 0;
  const now = Date.now();
  if (dateRange === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    dateThreshold = startOfToday.getTime();
  } else if (dateRange === '7days') {
    dateThreshold = now - 7 * 24 * 60 * 60 * 1000;
  } else if (dateRange === '30days') {
    dateThreshold = now - 30 * 24 * 60 * 60 * 1000;
  }

  // Filter leads
  const filtered = leads.filter((lead) => {
    // 1. Status Filter
    if (status !== 'all' && String(lead.status).toLowerCase() !== String(status).toLowerCase()) {
      return false;
    }

    // 2. State Filter
    if (state !== 'all' && String(lead.state).toLowerCase() !== String(state).toLowerCase()) {
      return false;
    }

    // 3. Date Range Filter
    if (dateThreshold > 0 && new Date(lead.createdAt).getTime() < dateThreshold) {
      return false;
    }

    // 4. Search Filter
    if (searchLower) {
      const matchId = String(lead.id || '').toLowerCase().includes(searchLower);
      const matchName = String(lead.name || '').toLowerCase().includes(searchLower);
      const matchPhone = String(lead.phone || '').includes(searchLower);
      const matchWa = String(lead.whatsapp || '').includes(searchLower);
      const matchEmail = String(lead.email || '').toLowerCase().includes(searchLower);
      const matchCity = String(lead.city || '').toLowerCase().includes(searchLower);
      const matchState = String(lead.state || '').toLowerCase().includes(searchLower);
      return matchId || matchName || matchPhone || matchWa || matchEmail || matchCity || matchState;
    }

    return true;
  });

  // Calculate summary metrics
  const stats = {
    total: leads.length,
    newCount: leads.filter((l) => l.status === 'New').length,
    contactedCount: leads.filter((l) => l.status === 'Contacted').length,
    interestedCount: leads.filter((l) => l.status === 'Interested').length,
    followUpCount: leads.filter((l) => l.status === 'Follow-up Required').length,
    convertedCount: leads.filter((l) => l.status === 'Converted').length,
    rejectedCount: leads.filter((l) => l.status === 'Rejected').length
  };

  // Collect distinct states for filter dropdown
  const uniqueStates = Array.from(new Set(leads.map((l) => l.state).filter(Boolean))).sort();

  return {
    success: true,
    stats,
    states: uniqueStates,
    total: filtered.length,
    leads: filtered
  };
}

// Update lead details
export function updateFranchiseLead(leadId, updates = {}, adminUser = 'admin') {
  const leads = getArray('franchise_leads');
  const idx = leads.findIndex((l) => l.id === leadId);

  if (idx === -1) {
    return { success: false, error: 'Lead not found.' };
  }

  const existing = leads[idx];
  const nowIso = new Date().toISOString();

  // If a new note was submitted, append it
  const newNotes = Array.isArray(existing.internalNotes) ? [...existing.internalNotes] : [];
  if (updates.newNote && String(updates.newNote).trim()) {
    newNotes.unshift({
      id: 'note_' + Date.now(),
      author: adminUser,
      text: String(updates.newNote).trim(),
      timestamp: nowIso
    });
  }

  const updatedLead = {
    ...existing,
    status: updates.status || existing.status,
    assignedStaff: updates.assignedStaff !== undefined ? updates.assignedStaff : existing.assignedStaff,
    followUpDate: updates.followUpDate !== undefined ? updates.followUpDate : existing.followUpDate,
    internalNotes: newNotes,
    updatedAt: nowIso
  };

  leads[idx] = updatedLead;
  setArray('franchise_leads', leads);

  return {
    success: true,
    lead: updatedLead
  };
}

// Delete a lead (Admin only)
export function deleteFranchiseLead(leadId) {
  const leads = getArray('franchise_leads');
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) {
    return { success: false, error: 'Lead not found.' };
  }
  const deleted = leads.splice(idx, 1)[0];
  setArray('franchise_leads', leads);
  return { success: true, deletedLeadId: deleted.id };
}

function sanitizeLead(lead) {
  if (!lead) return null;
  const { consentTimestamp, adminNotificationStatus, customerNotificationStatus, ...safe } = lead;
  return safe;
}
