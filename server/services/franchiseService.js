import { getArray, setArray, getSingleton, setSingleton } from '../store.js';
import { normalizeIndianMobileNumber, isValidIndianMobileNumber } from './userService.js';
import { createTransporter, isSmtpConfigured, readEmailConfig, logEmailExecution } from './emailService.js';
import { generateFranchiseAdminAlertHtml, generateFranchiseAdminAlertText } from '../emailTemplates/franchiseAdminAlert.js';
import { generateFranchiseCustomerConfirmationHtml, generateFranchiseCustomerConfirmationText } from '../emailTemplates/franchiseCustomerConfirmation.js';

// Fallback CMS configuration if storage is not yet populated
export function getDefaultFranchiseCmsConfig() {
  return {
    isActive: true,
    desktopVisible: true,
    mobileVisible: true,
    hero: {
      badge: 'WHO-GMP & AYUSH PREMIUM QUALITY ASSURED',
      heading: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
      subtitle: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.',
      bannerImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&auto=format&fit=crop&q=80',
      primaryCta: 'Apply for Franchise',
      secondaryCta: 'WhatsApp Enquiry',
      whatsappNumber: '918872544458',
      helplineNumber: '+91 88725 44458'
    },
    benefits: [
      {
        id: 'ben_1',
        title: 'Wide Ayurvedic Product Portfolio',
        description: 'Access 250+ clinically standardized Ayurvedic formulations across classical syrups, oils, capsules, churnas, and vati.',
        icon: 'Package'
      },
      {
        id: 'ben_2',
        title: 'Marketing and Promotional Support',
        description: 'Receive comprehensive marketing literature, visual aids, MR bags, visiting cards, catch covers, and product glossaries.',
        icon: 'Sparkles'
      },
      {
        id: 'ben_3',
        title: 'Product and Packaging Information',
        description: 'Premium alu-alu and blister packaging with tamper-proof seals, transparent herbal compositions, and batch lab test certificates.',
        icon: 'ShieldCheck'
      },
      {
        id: 'ben_4',
        title: 'Business Enquiry Assistance',
        description: 'Prompt quotations, dedicated relationship executives, transparent billing, and dedicated assistance for all commercial queries.',
        icon: 'Headphones'
      },
      {
        id: 'ben_5',
        title: 'Territory-Based Franchise Opportunities',
        description: 'Mutually agreed district and territory distribution partnerships ensuring focused local market growth without channel conflict.',
        icon: 'MapPin'
      },
      {
        id: 'ben_6',
        title: 'Dedicated Business Communication',
        description: 'Reliable dispatch tracking via Delhivery, structured dispatch timelines, and regular pipeline updates directly from headquarters.',
        icon: 'Truck'
      }
    ],
    portfolioCategories: [
      { id: 'cat_capsules', name: 'Ayurvedic Capsules', slug: 'capsules', icon: 'Pill' },
      { id: 'cat_syrups', name: 'Herbal Syrups', slug: 'syrups', icon: 'FlaskConical' },
      { id: 'cat_tablets', name: 'Tablets', slug: 'tablets', icon: 'Layers' },
      { id: 'cat_powders', name: 'Herbal Powders', slug: 'powders', icon: 'Sparkles' },
      { id: 'cat_oils', name: 'Ayurvedic Oils', slug: 'oils', icon: 'Droplet' },
      { id: 'cat_nutra', name: 'Herbal and Nutraceutical Products', slug: 'nutraceuticals', icon: 'Heart' }
    ],
    processSteps: [
      {
        step: 1,
        title: 'Submit Franchise Enquiry',
        description: 'Fill the quick franchise enquiry form with your contact details, target territory, and background.'
      },
      {
        step: 2,
        title: 'Our Team Contacts You',
        description: 'Our senior business development manager reviews your application and reaches out within 24-48 business hours.'
      },
      {
        step: 3,
        title: 'Territory & Business Discussion',
        description: 'We discuss available territory rights, product margins, quotation terms, and order minimums tailored to your district.'
      },
      {
        step: 4,
        title: 'Documentation & Verification',
        description: 'Submit basic KYC, GSTIN, and relevant business registrations to establish authorized distribution credentials.'
      },
      {
        step: 5,
        title: 'Franchise Approval & Onboarding',
        description: 'Receive official franchise approval, promotional starter kit, marketing collateral, and first stock dispatch.'
      }
    ],
    targetAudience: [
      {
        title: 'Pharma Distributors',
        description: 'Established distribution firms aiming to expand their portfolio with proven, high-demand Ayurvedic lines.'
      },
      {
        title: 'Medical Representatives',
        description: 'Experienced pharma professionals seeking to transition into independent entrepreneurship with company backing.'
      },
      {
        title: 'Pharma Wholesalers',
        description: 'Stockists and wholesale medicine traders looking for competitive trade discounts and reliable supply chains.'
      },
      {
        title: 'Ayurvedic Product Retailers',
        description: 'Retail pharmacies, chemists, and Ayurvedic clinics wishing to stock authentic classical remedies.'
      },
      {
        title: 'New Business Entrepreneurs',
        description: 'Aspiring entrepreneurs entering India\'s high-growth herbal healthcare and botanical wellness ecosystem.'
      }
    ],
    formConfig: {
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
      ]
    },
    faqs: [
      {
        question: 'What is an Ayurvedic PCD Pharma Franchise?',
        answer: 'Propaganda Cum Distribution (PCD) is a business model where Fibax Ayurveda grants marketing and distribution rights to a franchise partner for a defined geographic territory, backed by promotional materials and consistent product supply.'
      },
      {
        question: 'Who can apply for a Fibax Ayurveda franchise?',
        answer: 'We welcome pharmaceutical distributors, experienced medical representatives, wholesalers, retail chemists, and aspiring healthcare entrepreneurs looking to build a sustainable business with authentic Ayurvedic remedies.'
      },
      {
        question: 'How is a territory allocated?',
        answer: 'Territories are allocated based on mutual commercial agreement, district vacancy, and existing distribution channels to prevent market cannibalization and protect your commercial efforts.'
      },
      {
        question: 'What documents are required?',
        answer: 'Basic identification (PAN and Aadhaar), GST registration certificate (if applicable), and existing business documentation. For proprietary Ayurvedic OTC products, our team will guide you on the simple regulatory requirements.'
      },
      {
        question: 'How can I enquire about the product range and price list?',
        answer: 'Submit the franchise enquiry form on this page or message our WhatsApp business helpline. Our team will share the complete Ayurvedic product catalogue, net dealer price list, and profit margins.'
      },
      {
        question: 'How does the franchise onboarding process work?',
        answer: 'Once your enquiry is verified and terms are agreed upon, we process your initial inventory order, prepare your marketing starter kit (visual aids, product literature), and dispatch via our express courier partner.'
      }
    ],
    contact: {
      phone: '+91 88725 44458',
      whatsapp: '918872544458',
      email: 'info@fibaxpharma.com',
      adminNotificationEmail: 'fibaxpharma@gmail.com'
    },
    updatedAt: new Date().toISOString()
  };
}

export function getFranchiseCmsConfig() {
  const cms = getSingleton('franchise_page_cms');
  if (cms && typeof cms === 'object') {
    return { ...getDefaultFranchiseCmsConfig(), ...cms };
  }
  return getDefaultFranchiseCmsConfig();
}

export function updateFranchiseCmsConfig(updates, adminUser = 'admin') {
  const current = getFranchiseCmsConfig();
  const merged = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
    lastModifiedBy: adminUser
  };
  setSingleton('franchise_page_cms', merged);
  return merged;
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
