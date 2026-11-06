import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  RefreshCw, 
  Trash2, 
  Barcode,
  Plus,
  ArrowLeft,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Package,
  ShieldCheck,
  HeartPulse,
  Leaf,
  Table as TableIcon,
  HelpCircle,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { CONCERNS } from '../../data/concerns';
import { apiRequest } from '../../utils/api';

const PRESET_IMAGES = [
  { name: 'Syrup Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/fp-enzyme.png' },
  { name: 'Capsules Bottle', url: 'https://fibaxpharma.com/wp-content/uploads/2024/03/Diabdic-cap-580-x580_webp.webp' },
  { name: 'Relief Oil', url: 'https://fibaxpharma.com/wp-content/uploads/2023/10/AXE-ORTHO-OIL-copy.webp' },
  { name: 'Herbal Powder', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/Ashwagandha-powder-2000px.webp' },
  { name: 'Herbal Soap', url: 'https://fibaxpharma.com/wp-content/uploads/2025/11/rose-soap-1000px.webp' },
];


const getDefaultProductContent = (product = {}) => {
  const title = product?.title || 'This Ayurvedic Formulation';
  const dosage = product?.dosage || '10-15 ml twice daily with warm water after meals';

  return {
    productIntroduction: product?.productIntroduction || {
      enabled: true,
      badge: 'Authentic Ayurvedic Heritage',
      heading: 'Root-Cause Restoration with 100% Raw Ayurvedic Herbs',
      description: `Unlike synthetic pills that provide temporary superficial relief, ${title} is prepared by traditional cold decoction extraction to preserve active botanical phytoconstituents. It nourishes deep tissue systems (Dhatus), eliminates accumulated toxic bio-waste (Ama), and restores physiological equilibrium naturally.`,
      features: [
        {
          title: 'Cold Extraction Method',
          description: 'Extracted within 24 hours of wild-crafting to retain heat-sensitive botanical enzymes, tannins, and bioflavonoids.',
          icon: 'leaf'
        },
        {
          title: 'Targets Biological Root Cause',
          description: 'Balances elevated Vata, Pitta, and Kapha doshas while optimizing cellular metabolism and digestive fire (Agni).',
          icon: 'heart'
        },
        {
          title: 'Heavy-Metal Lab Tested',
          description: 'Every batch undergoes rigorous 3-tier testing for Lead, Mercury, Arsenic, and microbial safety under AYUSH standards.',
          icon: 'shield'
        }
      ]
    },
    botanicalIngredients: product?.botanicalIngredients || {
      enabled: true,
      badge: 'What Goes Inside Every Bottle',
      heading: 'The Botanical Powerhouse Behind the Results',
      description: 'Each ingredient is selected based on classical Ayurvedic treatises and verified modern pharmacological research.',
      herbs: [
        {
          name: 'Amla (Indian Gooseberry)',
          sanskrit: 'Amalaki',
          role: 'Potent Vitamin C & Cellular Immunity',
          desc: 'Nourishes systemic tissues, balances all three doshas (Tridoshic), and strengthens cellular vitality.'
        },
        {
          name: 'Karela (Bitter Gourd)',
          sanskrit: 'Karavellaka',
          role: 'Active Polypeptide-p & Charantin',
          desc: 'Naturally activates AMP-activated protein kinase to promote healthy cellular glucose uptake.'
        },
        {
          name: 'Jamun (Black Plum)',
          sanskrit: 'Jambu Phala',
          role: 'Glycemic Regulation & Pancreatic Tonification',
          desc: 'Seeds and fruit extracts rich in jamboline that slow down the pathological conversion of starch into sugar.'
        },
        {
          name: 'Giloy (Guduchi)',
          sanskrit: 'Amrita — The Nectar of Life',
          role: 'Immunomodulator & Micro-Detox',
          desc: 'A divine Rasayana herb that cleanses liver-gut toxins (Ama) and enhances biological defense mechanisms.'
        },
        {
          name: 'Gudmar (Gymnema)',
          sanskrit: 'The Sugar Destroyer (Madhunashini)',
          role: 'Suppresses Sweet Receptors',
          desc: 'Clinically known to regenerate pancreatic islet beta cells and curb intense cravings for refined carbs.'
        },
        {
          name: 'Neem & Methi Extracts',
          sanskrit: 'Nimba & Methika',
          role: 'Lipid Balance & Metabolic Cleansing',
          desc: 'Improves digestive fire (Agni), enhances liver bile secretions, and protects micro-vascular capillary circulation.'
        }
      ]
    },
    usageInstructions: product?.usageInstructions || {
      enabled: true,
      badge: 'Daily Wellness Protocol',
      heading: 'How to Consume for Maximum Therapeutic Results',
      description: 'Consistency is key in Ayurvedic healing. Follow this simple 3-step ritual daily.',
      steps: [
        {
          stepNumber: 1,
          title: 'Shake & Measure',
          description: 'Shake the bottle thoroughly. Measure 20-30 ml (approx 2-3 tablespoons) of the formulation.'
        },
        {
          stepNumber: 2,
          title: 'Dilute with Water',
          description: 'Mix with an equal quantity (30 ml) of lukewarm or normal drinking water in a glass.'
        },
        {
          stepNumber: 3,
          title: 'Twice Daily Ritual',
          description: dosage || 'Drink once in the morning on an empty stomach and once 30 minutes after dinner.'
        }
      ],
      showProgression: true,
      progressionHeading: 'Your 90-Day Ayurvedic Course Progression',
      progressionStages: [
        {
          stage: 'Day 1 - 30 (Bottle 1)',
          title: 'Metabolic Detox & Cleansing',
          description: 'Flushes metabolic toxins (Ama), jumpstarts sluggish digestive Agni, and stabilizes morning fatigue.'
        },
        {
          stage: 'Day 31 - 60 (Bottle 2)',
          title: 'Organ Balance & Glycemic Control',
          description: 'Noticeable reduction in post-meal spikes, balanced lipid levels, and improved stamina throughout the day.'
        },
        {
          stage: 'Day 61 - 90 (Bottle 3)',
          title: 'Long-Term Equilibrium',
          description: 'Restores cellular receptor sensitivity, supports sustained organ vitality, and locks in long-term wellness.'
        }
      ]
    },
    comparisonTable: product?.comparisonTable || {
      enabled: true,
      badge: 'Clinical Comparison',
      heading: 'Why Fibax Pharma Stands Out',
      description: 'See the tangible difference between authentic cold-pressed Ayurveda and typical marketplace brands.',
      competitorHeader: 'Conventional Market Products',
      rows: [
        {
          feature: 'Extraction Technique',
          fibax: 'Cold Decoction & Raw Swaras',
          competitor: 'High-heat boiling (destroys enzymes)'
        },
        {
          feature: 'Sugar & Artificial Sweeteners',
          fibax: 'Zero Added Sugar or Aspartame',
          competitor: 'Often laden with sugar syrup for taste'
        },
        {
          feature: 'Raw Herb Sourcing',
          fibax: 'Certified Organic Ayurvedic Farms',
          competitor: 'Commercial dried powders of mixed origin'
        },
        {
          feature: 'Safety & Heavy Metal Testing',
          fibax: '3-Tier NABL Accredited Lab Tested',
          competitor: 'Rarely published batch test reports'
        },
        {
          feature: 'Government Approvals',
          fibax: 'AYUSH Ministry & GMP Certified',
          competitor: 'Standard food license only'
        }
      ]
    },
    faqsConfig: product?.faqsConfig || {
      enabled: true,
      badge: 'Everything You Need to Know',
      heading: 'Frequently Asked Questions',
      description: 'Clear answers to common questions about usage, safety, and course length.',
      items: [
        {
          q: 'Can I take this Ayurvedic formulation along with regular modern medicines?',
          a: 'Yes, Fibax formulations are 100% natural, AYUSH-approved botanical blends with zero synthetic chemicals. We advise maintaining a 30 to 45-minute gap between your regular medicines and Ayurvedic remedies.'
        },
        {
          q: 'How long should I follow the course for visible, lasting results?',
          a: 'Ayurveda addresses root imbalances rather than offering temporary suppression. We recommend a minimum 60 to 90-day course (3 bottles/packs) for cellular repair, metabolic balance, and sustained outcomes.'
        },
        {
          q: 'Are there any side effects or added preservatives?',
          a: 'None. Fibax products are free from added sugar, artificial colorings, parabens, and heavy metal impurities. They are formulated strictly in GMP and ISO-certified pharmaceutical facilities.'
        },
        {
          q: 'What is the recommended daily dosage and timing?',
          a: dosage || 'Take 15-30 ml mixed with equal parts lukewarm water, twice daily — preferably once on an empty stomach in the morning and once 30 minutes after dinner.'
        },
        {
          q: 'What are the delivery and storage guidelines?',
          a: 'All orders are dispatched within 24 hours via Delhivery Express with live tracking. Store the formulation in a cool, dry place away from direct sunlight. Shake well before each use.'
        }
      ]
    }
  };
};

export function ProductModal({ isOpen, onClose, onSave, productToEdit }) {
  const multiFileInputRef = useRef(null);
  const slotReplaceInputRef = useRef(null);
  const [replacingSlotIndex, setReplacingSlotIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Collapsible Accordion States for Product Detail Page Content Sections (top-level hook)
  const [openSections, setOpenSections] = useState({
    intro: false,
    ingredients: false,
    usage: false,
    comparison: false,
    faqs: false
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    categoryId: 'syrups',
    concernId: 'joint-pain-relief',
    dosageForm: 'Syrup',
    volumeWeight: '200 ml',
    mrp: 299,
    salePrice: 249,
    stockQuantity: 50,
    lowStockThreshold: 15,
    featuredImage: '',
    images: [],
    isBestseller: false,
    ayushCertified: true,
    shortDesc: '',
    ingredients: 'Standardized herbal extracts, purified botanical decoctions',
    dosage: '10-15 ml twice daily with warm water after meals',
    shippingPackage: {
      weightGrams: '',
      lengthCm: '',
      widthCm: '',
      heightCm: ''
    },
        productIntroduction: {
      enabled: true,
      badge: 'Authentic Ayurvedic Heritage',
      heading: 'Root-Cause Restoration with 100% Raw Ayurvedic Herbs',
      description: '',
      features: []
    },
    botanicalIngredients: {
      enabled: true,
      badge: 'What Goes Inside Every Bottle',
      heading: 'The Botanical Powerhouse Behind the Results',
      description: '',
      herbs: []
    },
    usageInstructions: {
      enabled: true,
      badge: 'Daily Wellness Protocol',
      heading: 'How to Consume for Maximum Therapeutic Results',
      description: '',
      steps: [],
      showProgression: true,
      progressionHeading: 'Your 90-Day Ayurvedic Course Progression',
      progressionStages: []
    },
    comparisonTable: {
      enabled: true,
      badge: 'Clinical Comparison',
      heading: 'Why Fibax Pharma Stands Out',
      description: '',
      competitorHeader: 'Conventional Market Products',
      rows: []
    },
    faqsConfig: {
      enabled: true,
      badge: 'Everything You Need to Know',
      heading: 'Frequently Asked Questions',
      description: '',
      items: []
    },
    treatmentCourseConfig: {
      enabled: false,
      heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
      recommendationText: 'Recommended 90-Day Course for Best Results',
      packs: []
    },
  });

  useEffect(() => {
    setUploadError('');
    if (productToEdit) {
      const mappedCat = productToEdit.categoryId || (
        productToEdit.dosageForm === 'Capsules' ? 'capsules' :
        productToEdit.dosageForm === 'Juice' ? 'juices' :
        productToEdit.dosageForm === 'Powder' ? 'powders' :
        productToEdit.dosageForm === 'Oil' ? 'oils' :
        (productToEdit.dosageForm === 'Soap' || productToEdit.dosageForm === 'Facewash') ? 'skincare' :
        'syrups'
      );

      const initialImages = Array.isArray(productToEdit.images) && productToEdit.images.length > 0
        ? productToEdit.images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean)
        : (productToEdit.featuredImage ? [productToEdit.featuredImage] : []);

      const sp = productToEdit.shippingPackage || {};
      const initWeight = sp.weightGrams ?? productToEdit.packageWeightGrams ?? '';
      const initLength = sp.lengthCm ?? productToEdit.packageLengthCm ?? '';
      const initWidth = sp.widthCm ?? productToEdit.packageWidthCm ?? '';
      const initHeight = sp.heightCm ?? productToEdit.packageHeightCm ?? '';

      setFormData({
        title: productToEdit.title || '',
        slug: productToEdit.slug || '',
        sku: productToEdit.sku || '',
        categoryId: mappedCat,
        concernId: productToEdit.concernId || 'joint-pain-relief',
        dosageForm: productToEdit.dosageForm || 'Syrup',
        volumeWeight: productToEdit.volumeWeight || '200 ml',
        mrp: productToEdit.mrp || 299,
        salePrice: productToEdit.salePrice || 249,
        stockQuantity: productToEdit.stockQuantity !== undefined ? productToEdit.stockQuantity : 50,
        lowStockThreshold: productToEdit.lowStockThreshold || 15,
        featuredImage: productToEdit.featuredImage || initialImages[0] || '',
        images: initialImages,
        isBestseller: !!productToEdit.isBestseller,
        ayushCertified: productToEdit.ayushCertified !== false,
        shortDesc: productToEdit.shortDesc || '',
        ingredients: productToEdit.ingredients || '',
        dosage: productToEdit.dosage || '',
        shippingPackage: {
          weightGrams: initWeight,
          lengthCm: initLength,
          widthCm: initWidth,
          heightCm: initHeight
        },
        treatmentCourseConfig: productToEdit.treatmentCourseConfig || {
          enabled: false,
          heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
          recommendationText: 'Recommended 90-Day Course for Best Results',
          packs: []
        },
        productIntroduction: productToEdit.productIntroduction || getDefaultProductContent(productToEdit).productIntroduction,
        botanicalIngredients: productToEdit.botanicalIngredients || getDefaultProductContent(productToEdit).botanicalIngredients,
        usageInstructions: productToEdit.usageInstructions || getDefaultProductContent(productToEdit).usageInstructions,
        comparisonTable: productToEdit.comparisonTable || getDefaultProductContent(productToEdit).comparisonTable,
        faqsConfig: productToEdit.faqsConfig || getDefaultProductContent(productToEdit).faqsConfig,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        sku: '',
        categoryId: 'syrups',
        concernId: 'joint-pain-relief',
        dosageForm: 'Syrup',
        volumeWeight: '200 ml',
        mrp: 299,
        salePrice: 249,
        stockQuantity: 50,
        lowStockThreshold: 15,
        featuredImage: '',
        images: [],
        isBestseller: false,
        ayushCertified: true,
        shortDesc: '',
        ingredients: 'Standardized herbal extracts, purified botanical decoctions',
        dosage: '10-15 ml twice daily with warm water after meals',
        shippingPackage: {
          weightGrams: '',
          lengthCm: '',
          widthCm: '',
          heightCm: ''
        },
        treatmentCourseConfig: {
          enabled: false,
          heading: 'SELECT TREATMENT COURSE / VALUE PACK:',
          recommendationText: 'Recommended 90-Day Course for Best Results',
          packs: []
        },
        productIntroduction: getDefaultProductContent({}).productIntroduction,
        botanicalIngredients: getDefaultProductContent({}).botanicalIngredients,
        usageInstructions: getDefaultProductContent({}).usageInstructions,
        comparisonTable: getDefaultProductContent({}).comparisonTable,
        faqsConfig: getDefaultProductContent({}).faqsConfig,
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const discountPercent = Math.round(((formData.mrp - formData.salePrice) / formData.mrp) * 100);
  const currentImageCount = formData.images ? formData.images.length : 0;

  // Auto-generate standardized SKU (e.g. FBX-ASHWA-200ML)
    const handleAddPack = () => {
    const currentPacks = formData.treatmentCourseConfig?.packs || [];
    if (currentPacks.length >= 5) {
      alert('Maximum 5 treatment packs allowed per product.');
      return;
    }
    const newPack = {
      id: Date.now(),
      name: '',
      quantity: 1,
      duration: '',
      price: formData.salePrice || '',
      discountPercent: 0,
      promotionalLabel: '',
      sortOrder: currentPacks.length + 1
    };
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: [...currentPacks, newPack]
      }
    }));
  };

  const handleUpdatePack = (index, field, value) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    if (!currentPacks[index]) return;
    currentPacks[index] = {
      ...currentPacks[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: currentPacks
      }
    }));
  };

  const handleDeletePack = (index) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    currentPacks.splice(index, 1);
    const reordered = currentPacks.map((p, i) => ({ ...p, sortOrder: i + 1 }));
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: reordered
      }
    }));
  };

  const handleMovePack = (index, direction) => {
    const currentPacks = [...(formData.treatmentCourseConfig?.packs || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentPacks.length) return;
    const temp = currentPacks[index];
    currentPacks[index] = currentPacks[targetIndex];
    currentPacks[targetIndex] = temp;
    const reordered = currentPacks.map((p, i) => ({ ...p, sortOrder: i + 1 }));
    setFormData(prev => ({
      ...prev,
      treatmentCourseConfig: {
        ...prev.treatmentCourseConfig,
        packs: reordered
      }
    }));
  };

  const handleAutoGenerateSku = () => {
    const rawTitle = formData.title.trim() || 'PRODUCT';
    const cleanPrefix = rawTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);

    const cleanVol = (formData.volumeWeight || 'STD')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5);

    const randomDigits = Math.floor(100 + Math.random() * 900);
    const generated = `FBX-${cleanPrefix}-${cleanVol || randomDigits}`;
    setFormData(prev => ({ ...prev, sku: generated }));
  };

  
  // Collapsible Accordion States moved to top of component to respect React Rules of Hooks

  const toggleAccordion = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const updateSectionField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateSectionEnabled = (section, enabled) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled
      }
    }));
  };

  // Section 1: Intro Features
  const handleAddIntroFeature = () => {
    setFormData(prev => ({
      ...prev,
      productIntroduction: {
        ...prev.productIntroduction,
        features: [
          ...(prev.productIntroduction?.features || []),
          { title: 'New Botanical Benefit', description: 'Describe clinical or traditional therapeutic benefit', icon: 'leaf' }
        ]
      }
    }));
  };

  const handleUpdateIntroFeature = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.productIntroduction?.features || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        productIntroduction: { ...prev.productIntroduction, features: list }
      };
    });
  };

  const handleDeleteIntroFeature = (idx) => {
    setFormData(prev => {
      const list = [...(prev.productIntroduction?.features || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        productIntroduction: { ...prev.productIntroduction, features: list }
      };
    });
  };

  // Section 2: Botanical Ingredients
  const handleAddHerb = () => {
    setFormData(prev => ({
      ...prev,
      botanicalIngredients: {
        ...prev.botanicalIngredients,
        herbs: [
          ...(prev.botanicalIngredients?.herbs || []),
          { name: '', sanskrit: '', role: '', desc: '' }
        ]
      }
    }));
  };

  const handleUpdateHerb = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.botanicalIngredients?.herbs || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        botanicalIngredients: { ...prev.botanicalIngredients, herbs: list }
      };
    });
  };

  const handleDeleteHerb = (idx) => {
    setFormData(prev => {
      const list = [...(prev.botanicalIngredients?.herbs || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        botanicalIngredients: { ...prev.botanicalIngredients, herbs: list }
      };
    });
  };

  // Section 3: Usage Instructions
  const handleAddUsageStep = () => {
    setFormData(prev => {
      const current = prev.usageInstructions?.steps || [];
      return {
        ...prev,
        usageInstructions: {
          ...prev.usageInstructions,
          steps: [
            ...current,
            { stepNumber: current.length + 1, title: '', description: '' }
          ]
        }
      };
    });
  };

  const handleUpdateUsageStep = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.usageInstructions?.steps || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        usageInstructions: { ...prev.usageInstructions, steps: list }
      };
    });
  };

  const handleDeleteUsageStep = (idx) => {
    setFormData(prev => {
      const list = [...(prev.usageInstructions?.steps || [])];
      list.splice(idx, 1);
      const renumbered = list.map((s, i) => ({ ...s, stepNumber: i + 1 }));
      return {
        ...prev,
        usageInstructions: { ...prev.usageInstructions, steps: renumbered }
      };
    });
  };

  const handleAddProgressionStage = () => {
    setFormData(prev => ({
      ...prev,
      usageInstructions: {
        ...prev.usageInstructions,
        progressionStages: [
          ...(prev.usageInstructions?.progressionStages || []),
          { stage: 'Day 1 - 30 (Bottle 1)', title: '', description: '' }
        ]
      }
    }));
  };

  const handleUpdateProgressionStage = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.usageInstructions?.progressionStages || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        usageInstructions: { ...prev.usageInstructions, progressionStages: list }
      };
    });
  };

  const handleDeleteProgressionStage = (idx) => {
    setFormData(prev => {
      const list = [...(prev.usageInstructions?.progressionStages || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        usageInstructions: { ...prev.usageInstructions, progressionStages: list }
      };
    });
  };

  // Section 4: Comparison Table
  const handleAddComparisonRow = () => {
    setFormData(prev => ({
      ...prev,
      comparisonTable: {
        ...prev.comparisonTable,
        rows: [
          ...(prev.comparisonTable?.rows || []),
          { feature: '', fibax: '', competitor: '' }
        ]
      }
    }));
  };

  const handleUpdateComparisonRow = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.comparisonTable?.rows || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        comparisonTable: { ...prev.comparisonTable, rows: list }
      };
    });
  };

  const handleDeleteComparisonRow = (idx) => {
    setFormData(prev => {
      const list = [...(prev.comparisonTable?.rows || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        comparisonTable: { ...prev.comparisonTable, rows: list }
      };
    });
  };

  // Section 5: FAQs
  const handleAddFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqsConfig: {
        ...prev.faqsConfig,
        items: [
          ...(prev.faqsConfig?.items || []),
          { q: '', a: '' }
        ]
      }
    }));
  };

  const handleUpdateFaq = (idx, field, val) => {
    setFormData(prev => {
      const list = [...(prev.faqsConfig?.items || [])];
      list[idx] = { ...list[idx], [field]: val };
      return {
        ...prev,
        faqsConfig: { ...prev.faqsConfig, items: list }
      };
    });
  };

  const handleDeleteFaq = (idx) => {
    setFormData(prev => {
      const list = [...(prev.faqsConfig?.items || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        faqsConfig: { ...prev.faqsConfig, items: list }
      };
    });
  };

  // Multi-image Bulk File Upload handler
  const handleBulkFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError('');
    const validFiles = [];

    for (const file of files) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
        setUploadError('Please upload a valid JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image must be 5 MB or smaller.');
        return;
      }
      validFiles.push(file);
    }

    setUploadProgress(true);

    try {
      const uploadedUrls = [];
      for (const file of validFiles) {
        const base64Content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        try {
          const res = await apiRequest('/api/upload', {
            method: 'POST',
            body: JSON.stringify({
              image: base64Content,
              filename: file.name
            })
          });
          if (res.success && res.url) {
            uploadedUrls.push(res.url);
          } else {
            uploadedUrls.push(base64Content);
          }
        } catch {
          uploadedUrls.push(base64Content);
        }
      }

      setFormData(prev => {
        const updatedImages = [...(prev.images || []), ...uploadedUrls];
        return {
          ...prev,
          images: updatedImages,
          featuredImage: prev.featuredImage || updatedImages[0] || ''
        };
      });
    } catch (err) {
      console.error('Error uploading images:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploadProgress(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Slot Replace Upload handler
  const handleSlotReplaceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || replacingSlotIndex === null) return;

    setUploadError('');
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setUploadError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5 MB or smaller.');
      return;
    }

    setUploadProgress(true);

    try {
      const base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      let finalUrl = base64Content;
      try {
        const res = await apiRequest('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: base64Content,
            filename: file.name
          })
        });
        if (res.success && res.url) {
          finalUrl = res.url;
        }
      } catch (err) {
        console.warn('Server upload fallback:', err);
      }

      setFormData(prev => {
        const newImages = [...(prev.images || [])];
        newImages[replacingSlotIndex] = finalUrl;
        return {
          ...prev,
          images: newImages,
          featuredImage: replacingSlotIndex === 0 ? finalUrl : (prev.featuredImage || newImages[0] || '')
        };
      });
    } catch (err) {
      setUploadError('Failed to replace image.');
    } finally {
      setUploadProgress(false);
      setReplacingSlotIndex(null);
      if (slotReplaceInputRef.current) slotReplaceInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      if (index <= 0 || index >= currentImages.length) return prev;
      const targetImg = currentImages[index];
      currentImages.splice(index, 1);
      currentImages.unshift(targetImg);
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0]
      };
    });
  };

  const handleMoveImage = (index, direction) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentImages.length) return prev;
      const temp = currentImages[index];
      currentImages[index] = currentImages[targetIndex];
      currentImages[targetIndex] = temp;
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0]
      };
    });
  };

  const handleDeleteImage = (index) => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      currentImages.splice(index, 1);
      if (currentImages.length < 5) {
        setUploadError('Product has fewer than 5 images.');
      } else {
        setUploadError('');
      }
      return {
        ...prev,
        images: currentImages,
        featuredImage: currentImages[0] || ''
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.salePrice) {
      alert('Please provide product title and selling price.');
      return;
    }

    if (formData.treatmentCourseConfig?.enabled) {
      const packs = formData.treatmentCourseConfig.packs || [];
      if (packs.length === 0) {
        alert('Please add at least 1 pack when Treatment Course / Value Pack is enabled.');
        return;
      }
      if (packs.length > 5) {
        alert('Maximum 5 packs are allowed per product.');
        return;
      }
      for (let i = 0; i < packs.length; i++) {
        const pack = packs[i];
        if (!pack.name || !pack.name.trim()) {
          alert(`Pack #${i + 1}: Pack Name is required.`);
          return;
        }
        if (!pack.quantity || Number(pack.quantity) <= 0) {
          alert(`Pack #${i + 1}: Quantity must be greater than 0.`);
          return;
        }
        if (!pack.price || Number(pack.price) <= 0) {
          alert(`Pack #${i + 1}: Selling Price must be greater than 0.`);
          return;
        }
        if (pack.discountPercent !== undefined && pack.discountPercent !== '' && (Number(pack.discountPercent) < 0 || Number(pack.discountPercent) > 100)) {
          alert(`Pack #${i + 1}: Discount must be between 0% and 100%.`);
          return;
        }
      }
    }

    const sp = formData.shippingPackage || {};
    const w = Number(sp.weightGrams);
    const l = Number(sp.lengthCm);
    const wi = Number(sp.widthCm);
    const h = Number(sp.heightCm);

    const hasWeight = sp.weightGrams !== '' && sp.weightGrams !== null && !isNaN(w);
    const hasLength = sp.lengthCm !== '' && sp.lengthCm !== null && !isNaN(l);
    const hasWidth = sp.widthCm !== '' && sp.widthCm !== null && !isNaN(wi);
    const hasHeight = sp.heightCm !== '' && sp.heightCm !== null && !isNaN(h);

    if (!productToEdit) {
      if (!hasWeight || w <= 0 || !hasLength || l <= 0 || !hasWidth || wi <= 0 || !hasHeight || h <= 0) {
        alert('Required for accurate courier shipping calculation. Please enter positive numeric values for Package Weight (grams) and Dimensions (Length, Width, Height in cm).');
        return;
      }
    } else {
      if ((hasWeight && w <= 0) || (hasLength && l <= 0) || (hasWidth && wi <= 0) || (hasHeight && h <= 0)) {
        alert('Package weight and dimensions must be positive numeric values greater than 0.');
        return;
      }
    }

    // Default SKU if empty
    const finalSku = formData.sku.trim() || `FBX-${Math.floor(100000 + Math.random() * 900000)}`;

    const finalImages = formData.images && formData.images.length > 0 ? formData.images : (formData.featuredImage ? [formData.featuredImage] : []);
    const primaryImg = finalImages[0] || formData.featuredImage || '';

    const finalWeight = hasWeight && w > 0 ? w : 0;
    const finalLength = hasLength && l > 0 ? l : 0;
    const finalWidth = hasWidth && wi > 0 ? wi : 0;
    const finalHeight = hasHeight && h > 0 ? h : 0;

    onSave({
      ...formData,
      sku: finalSku,
      title: formData.title.trim(),
      featuredImage: primaryImg,
      images: finalImages,
      shippingPackage: {
        weightGrams: finalWeight,
        lengthCm: finalLength,
        widthCm: finalWidth,
        heightCm: finalHeight
      },
      packageWeightGrams: finalWeight,
      packageLengthCm: finalLength,
      packageWidthCm: finalWidth,
      packageHeightCm: finalHeight
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-sand-border animate-scaleIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-sand-border bg-sand/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-forest-deep">
                {productToEdit ? 'Edit Ayurvedic Formulation' : 'Add New Formulation to Catalog'}
              </h3>
              <p className="text-xs text-charcoal-muted">
                Configure formulation title, SKU code, product image, and stock inventory.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="product-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hidden inputs for file uploads */}
          <input
            id="product-multi-file-input"
            type="file"
            ref={multiFileInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
            multiple
            onChange={handleBulkFileUpload}
            className="hidden"
          />
          <input
            id="product-slot-replace-input"
            type="file"
            ref={slotReplaceInputRef}
            accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
            onChange={handleSlotReplaceUpload}
            className="hidden"
          />

          {/* 1. Title & SKU Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7 space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Fibax Ashwagandha Vitality Syrup 200ml"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-medium"
              />
            </div>

            {/* SKU Input with Auto-Generate Tool */}
            <div className="sm:col-span-5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1">
                  <Barcode className="h-3.5 w-3.5 text-forest" />
                  <span>SKU Code *</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[10px] text-brand font-bold hover:underline flex items-center gap-0.5"
                  title="Auto generate SKU from title and pack size"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Auto-Gen</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. FBX-ASHWA-200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-mono font-bold text-forest bg-sand/20"
              />
            </div>
          </div>

          {/* 2. PRODUCT IMAGES / GALLERY SECTION */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-forest" />
                  <span>PRODUCT IMAGES / GALLERY</span>
                </label>

                {/* Counter Badge */}
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border ${
                  currentImageCount >= 5 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {currentImageCount >= 5 ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>Images: {currentImageCount}/5</span>
                  {currentImageCount >= 5 ? <span>✓</span> : <span className="text-[10px] text-amber-600 font-normal">(Min 5 recommended)</span>}
                </div>
              </div>

              {/* Bulk Upload Button */}
              <label
                htmlFor="product-multi-file-input"
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer select-none"
              >
                {uploadProgress ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>+ Upload Images</span>
                  </>
                )}
              </label>
            </div>

            <p className="text-[11px] text-charcoal-muted">
              Select multiple product images at once (Minimum 5 recommended). First image is automatically designated as <strong className="text-forest">PRIMARY</strong>. Supported formats: JPG, PNG, WebP (Max 5MB).
            </p>

            {uploadError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Gallery Grid */}
            {currentImageCount > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {formData.images.map((imgUrl, index) => {
                  const isPrimary = index === 0;
                  return (
                    <div 
                      key={`${imgUrl}-${index}`}
                      className={`relative bg-white rounded-xl border p-2 flex flex-col justify-between shadow-xs transition-all ${
                        isPrimary ? 'border-forest ring-2 ring-forest/20' : 'border-sand-border hover:border-forest/40'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative w-full h-28 rounded-lg bg-sand/40 border border-sand-border overflow-hidden flex items-center justify-center mb-2">
                        <img
                          src={imgUrl}
                          alt={`Product Image ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />

                        {/* Order & Primary Badge */}
                        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
                          {isPrimary ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-forest text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                              <Star className="h-2.5 w-2.5 fill-white" />
                              PRIMARY
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold">
                              Image {index + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-1.5">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="w-full py-1 px-1.5 rounded-md bg-sand/80 hover:bg-forest hover:text-white text-forest text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Star className="h-2.5 w-2.5" />
                            <span>Set Primary</span>
                          </button>
                        )}

                        <div className="flex items-center justify-between gap-1 border-t border-sand-border/60 pt-1.5">
                          {/* Reorder Left/Right */}
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, 'left')}
                              className="p-1 rounded bg-sand hover:bg-sand-border text-charcoal disabled:opacity-30 disabled:hover:bg-sand text-[10px]"
                              title="Move Left"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === currentImageCount - 1}
                              onClick={() => handleMoveImage(index, 'right')}
                              className="p-1 rounded bg-sand hover:bg-sand-border text-charcoal disabled:opacity-30 disabled:hover:bg-sand text-[10px]"
                              title="Move Right"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Replace & Delete */}
                          <div className="flex items-center gap-1">
                            <label
                              htmlFor="product-slot-replace-input"
                              onClick={() => setReplacingSlotIndex(index)}
                              className="px-1.5 py-0.5 rounded bg-sand hover:bg-sand-border text-forest text-[10px] font-bold cursor-pointer"
                              title="Replace this image"
                            >
                              Replace
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(index)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-[10px]"
                              title="Delete Image"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <label 
                htmlFor="product-multi-file-input"
                className="border-2 border-dashed border-sand-border rounded-xl p-6 text-center hover:border-forest/50 transition-colors cursor-pointer bg-white block"
              >
                <ImageIcon className="h-8 w-8 text-charcoal-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-forest">No product images uploaded yet</p>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  Click here or press <strong>+ Upload Images</strong> above to select minimum 5 product images.
                </p>
              </label>
            )}

            {/* Presets Row */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              <span className="text-[10px] font-bold text-charcoal-muted uppercase whitespace-nowrap">Add Sample Presets:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const updated = [...(prev.images || []), preset.url];
                      return {
                        ...prev,
                        images: updated,
                        featuredImage: prev.featuredImage || updated[0] || ''
                      };
                    });
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-sand-border hover:bg-sand text-charcoal hover:text-forest transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Category, Format & Concern */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Product Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const dosageMap = {
                    syrups: 'Syrup',
                    capsules: 'Capsules',
                    juices: 'Juice',
                    powders: 'Powder',
                    oils: 'Oil',
                    skincare: 'Soap'
                  };
                  setFormData(prev => ({
                    ...prev,
                    categoryId: newCat,
                    dosageForm: dosageMap[newCat] || prev.dosageForm
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Dosage Form
              </label>
              <select
                value={formData.dosageForm}
                onChange={(e) => {
                  const newDosage = e.target.value;
                  const catMap = {
                    'Syrup': 'syrups',
                    'Capsules': 'capsules',
                    'Juice': 'juices',
                    'Powder': 'powders',
                    'Oil': 'oils',
                    'Soap': 'skincare',
                    'Facewash': 'skincare'
                  };
                  setFormData(prev => ({
                    ...prev,
                    dosageForm: newDosage,
                    categoryId: catMap[newDosage] || prev.categoryId
                  }));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                <option value="Syrup">Syrup / Tonic</option>
                <option value="Capsules">Capsules / Tablets</option>
                <option value="Juice">Juice (Swaras)</option>
                <option value="Powder">Powder (Churna)</option>
                <option value="Oil">Oil (Taila)</option>
                <option value="Soap">Herbal Soap</option>
                <option value="Facewash">Facewash / Gel</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Target Concern
              </label>
              <select
                value={formData.concernId}
                onChange={(e) => setFormData({ ...formData, concernId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs bg-white font-medium"
              >
                {CONCERNS.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Volume / Weight
              </label>
              <input
                type="text"
                value={formData.volumeWeight}
                onChange={(e) => setFormData({ ...formData, volumeWeight: e.target.value })}
                placeholder="e.g. 200 ml or 60 Caps"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* 3.4 SHIPPING PACKAGE DETAILS SECTION */}
          {(() => {
            const sp = formData.shippingPackage || {};
            const w = Number(sp.weightGrams);
            const l = Number(sp.lengthCm);
            const wi = Number(sp.widthCm);
            const h = Number(sp.heightCm);
            const isConfigured = !isNaN(w) && w > 0 && !isNaN(l) && l > 0 && !isNaN(wi) && wi > 0 && !isNaN(h) && h > 0;

            return (
              <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                      <Package className="h-4 w-4 text-forest" />
                      <span>SHIPPING PACKAGE DETAILS</span>
                      {isConfigured ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>✓ Used for courier freight calculation</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>⚠ Package dimensions and weight not configured.</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">
                      Enter the final packed parcel weight and outer package dimensions used for courier shipping.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  {/* Package Weight */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE WEIGHT *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 320"
                        value={formData.shippingPackage?.weightGrams ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              weightGrams: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-12 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        grams
                      </span>
                    </div>
                  </div>

                  {/* Package Length */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE LENGTH *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 15"
                        value={formData.shippingPackage?.lengthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              lengthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Package Width */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE WIDTH *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 8"
                        value={formData.shippingPackage?.widthCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              widthCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Package Height */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      PACKAGE HEIGHT *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder="e.g. 6"
                        value={formData.shippingPackage?.heightCm ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            shippingPackage: {
                              ...prev.shippingPackage,
                              heightCm: val === '' ? '' : val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest text-xs font-bold bg-white"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-charcoal-muted pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-charcoal-muted italic">
                  * Required for accurate courier shipping calculation. Outer package dimensions are used for parcel shipping.
                </p>
              </div>
            );
          })()}

          {/* 3.5 TREATMENT COURSE / VALUE PACK SECTION */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span>TREATMENT COURSE / VALUE PACK</span>
                </h4>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  Configure custom treatment courses and bundle options for frontend purchase options.
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.treatmentCourseConfig?.enabled}
                  onChange={(e) => {
                    const isEnabled = e.target.checked;
                    const currentPacks = formData.treatmentCourseConfig?.packs || [];
                    setFormData(prev => ({
                      ...prev,
                      treatmentCourseConfig: {
                        ...prev.treatmentCourseConfig,
                        enabled: isEnabled,
                        heading: prev.treatmentCourseConfig?.heading || 'SELECT TREATMENT COURSE / VALUE PACK:',
                        recommendationText: prev.treatmentCourseConfig?.recommendationText !== undefined 
                          ? prev.treatmentCourseConfig.recommendationText 
                          : 'Recommended 90-Day Course for Best Results',
                        packs: isEnabled && currentPacks.length === 0 ? [
                          { id: Date.now(), name: '1 Unit (Standard)', quantity: 1, duration: '', price: formData.salePrice || 230, discountPercent: 0, promotionalLabel: 'STANDARD', sortOrder: 1 },
                          { id: Date.now() + 1, name: '2 Units (Value Pack)', quantity: 2, duration: '', price: Math.round((formData.salePrice || 230) * 2 * 0.9), discountPercent: 10, promotionalLabel: '10% OFF', sortOrder: 2 },
                          { id: Date.now() + 2, name: '3-Month Course (Best Value)', quantity: 3, duration: '3 Months', price: Math.round((formData.salePrice || 230) * 3 * 0.85), discountPercent: 15, promotionalLabel: 'BEST VALUE', sortOrder: 3 }
                        ] : currentPacks
                      }
                    }));
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
                <span className="ml-2 text-xs font-bold text-charcoal uppercase">
                  {formData.treatmentCourseConfig?.enabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {formData.treatmentCourseConfig?.enabled && (
              <div className="space-y-4 pt-2 border-t border-sand-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Section Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.treatmentCourseConfig?.heading || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        treatmentCourseConfig: {
                          ...prev.treatmentCourseConfig,
                          heading: e.target.value
                        }
                      }))}
                      placeholder="SELECT TREATMENT COURSE / VALUE PACK:"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-charcoal">
                      Recommendation / Highlight Text
                    </label>
                    <input
                      type="text"
                      value={formData.treatmentCourseConfig?.recommendationText || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        treatmentCourseConfig: {
                          ...prev.treatmentCourseConfig,
                          recommendationText: e.target.value
                        }
                      }))}
                      placeholder="Recommended 90-Day Course for Best Results"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                      Configured Packs ({formData.treatmentCourseConfig?.packs?.length || 0}/5)
                    </span>
                    {(formData.treatmentCourseConfig?.packs?.length || 0) < 5 && (
                      <button
                        type="button"
                        onClick={handleAddPack}
                        className="px-3 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>+ Add Pack</span>
                      </button>
                    )}
                  </div>

                  {formData.treatmentCourseConfig?.packs?.map((pack, index) => {
                    const qty = Number(pack.quantity) || 0;
                    const price = Number(pack.price) || 0;
                    const unitPriceDisplay = qty > 0 && price > 0 ? `₹${Math.round(price / qty)} / unit` : '-';

                    return (
                      <div key={pack.id || index} className="p-3.5 rounded-xl bg-white border border-sand-border space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-sand-border/60 pb-2">
                          <span className="text-xs font-extrabold text-forest uppercase tracking-wider">
                            PACK {index + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMovePack(index, 'up')}
                              className="p-1 rounded bg-sand hover:bg-sand-border disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-charcoal"
                              title="Move Up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              disabled={index === (formData.treatmentCourseConfig?.packs?.length || 0) - 1}
                              onClick={() => handleMovePack(index, 'down')}
                              className="p-1 rounded bg-sand hover:bg-sand-border disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-charcoal"
                              title="Move Down"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePack(index)}
                              className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold ml-1"
                              title="Delete Pack"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Pack Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pack.name || ''}
                              onChange={(e) => handleUpdatePack(index, 'name', e.target.value)}
                              placeholder="e.g. 1 Unit (Standard)"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Quantity / Units <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={pack.quantity || ''}
                              onChange={(e) => handleUpdatePack(index, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="1"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">Duration (Optional)</label>
                            <input
                              type="text"
                              value={pack.duration || ''}
                              onChange={(e) => handleUpdatePack(index, 'duration', e.target.value)}
                              placeholder="e.g. 3 Months"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">
                              Selling Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={pack.price || ''}
                              onChange={(e) => handleUpdatePack(index, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="230"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-charcoal">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pack.discountPercent !== undefined ? pack.discountPercent : ''}
                              onChange={(e) => handleUpdatePack(index, 'discountPercent', e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[11px] font-bold text-charcoal">Promotional Label</label>
                            <input
                              type="text"
                              value={pack.promotionalLabel || ''}
                              onChange={(e) => handleUpdatePack(index, 'promotionalLabel', e.target.value)}
                              placeholder="e.g. STANDARD or 10% OFF"
                              className="w-full px-3 py-1.5 rounded-lg border border-sand-border focus:ring-1 focus:ring-forest text-xs font-medium"
                            />
                          </div>

                          <div className="space-y-1 flex items-end">
                            <div className="w-full px-3 py-1.5 rounded-lg bg-sand/60 border border-sand-border text-[11px] font-bold text-forest">
                              Price per unit: <span className="text-charcoal">{unitPriceDisplay}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Pricing & Offer Section */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Offer Pricing & Discounts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Regular MRP (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Special Sale Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest text-forest focus:ring-2 focus:ring-forest focus:outline-none text-sm font-bold bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Calculated Discount</label>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                  <span>Save {discountPercent}%</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Auto</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Stock & Inventory Control */}
          <div className="bg-sand/30 p-4 rounded-2xl border border-sand-border space-y-3">
            <h4 className="text-xs font-bold text-forest uppercase tracking-wider">
              Stock & Inventory Control
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Current Stock Units</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* Bestseller & Badges */}
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>Highlight as Bestseller on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal">
                <input
                  type="checkbox"
                  checked={formData.ayushCertified}
                  onChange={(e) => setFormData({ ...formData, ayushCertified: e.target.checked })}
                  className="w-4 h-4 rounded text-forest focus:ring-forest"
                />
                <span>AYUSH Ministry Certified</span>
              </label>
            </div>
          </div>

          {/* 6. Description & Ingredients */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                Short Description & Health Indications
              </label>
              <textarea
                rows={2}
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="Targeted natural relief for joint inflammation, stiffness, and cartilage lubrication..."
                className="w-full px-3.5 py-2 rounded-xl border border-sand-border focus:ring-2 focus:ring-forest focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Key Ingredients</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g. Shallaki, Guggulu, Ashwagandha"
                  className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-charcoal">Dosage Instructions</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. 10 ml twice daily with warm water"
                  className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          
          {/* 7. Product Detail Page Content Sections (Collapsible Accordions) */}
          <div className="space-y-4 pt-4 border-t border-sand-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-forest-deep flex items-center gap-2">
                  <Layers className="h-4 w-4 text-forest" />
                  <span>Product Detail Page Content Management</span>
                </h4>
                <p className="text-xs text-charcoal-muted">
                  Customize the 5 high-converting sections for this specific formulation. Each section can be independently toggled on or off.
                </p>
              </div>
            </div>

            {/* Accordion 1: Product Introduction / Hero Content */}
            <div className="border border-sand-border rounded-2xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() => toggleAccordion('intro')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-sand/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-deep">1. Product Introduction / Hero Content</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.productIntroduction?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.productIntroduction?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Story, clinical formulation background, and core value highlights.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-charcoal">
                    <input
                      type="checkbox"
                      checked={formData.productIntroduction?.enabled !== false}
                      onChange={(e) => updateSectionEnabled('productIntroduction', e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('intro')}
                    className="p-1 text-charcoal-muted hover:text-forest"
                  >
                    {openSections.intro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {openSections.intro && (
                <div className="p-4 pt-2 border-t border-sand-border/60 bg-sand/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Badge Tag</label>
                      <input
                        type="text"
                        value={formData.productIntroduction?.badge || ''}
                        onChange={(e) => updateSectionField('productIntroduction', 'badge', e.target.value)}
                        placeholder="e.g. Authentic Ayurvedic Heritage"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={formData.productIntroduction?.heading || ''}
                        onChange={(e) => updateSectionField('productIntroduction', 'heading', e.target.value)}
                        placeholder="e.g. Root-Cause Restoration with 100% Raw Ayurvedic Herbs"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Description &amp; Formulation Story</label>
                    <textarea
                      rows={3}
                      value={formData.productIntroduction?.description || ''}
                      onChange={(e) => updateSectionField('productIntroduction', 'description', e.target.value)}
                      placeholder="Explain how this specific formulation heals at the root cause..."
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                    />
                  </div>

                  {/* Feature Highlights Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-forest uppercase tracking-wider">Feature Highlight Cards</label>
                      <button
                        type="button"
                        onClick={handleAddIntroFeature}
                        className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Card</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.productIntroduction?.features || []).map((feat, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="w-full sm:w-28 flex-shrink-0">
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Icon</label>
                            <select
                              value={feat.icon || 'leaf'}
                              onChange={(e) => handleUpdateIntroFeature(idx, 'icon', e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-sand-border text-xs bg-white"
                            >
                              <option value="leaf">🌿 Leaf</option>
                              <option value="heart">❤️ Heart</option>
                              <option value="shield">🛡️ Shield</option>
                              <option value="sparkles">✨ Sparkles</option>
                            </select>
                          </div>
                          <div className="w-full sm:w-44 flex-shrink-0">
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Title</label>
                            <input
                              type="text"
                              value={feat.title || ''}
                              onChange={(e) => handleUpdateIntroFeature(idx, 'title', e.target.value)}
                              placeholder="Feature title"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Description</label>
                            <input
                              type="text"
                              value={feat.description || ''}
                              onChange={(e) => handleUpdateIntroFeature(idx, 'description', e.target.value)}
                              placeholder="Feature detail"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteIntroFeature(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg mt-3 sm:mt-0"
                            title="Remove card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Botanical Ingredients */}
            <div className="border border-sand-border rounded-2xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() => toggleAccordion('ingredients')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-sand/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-deep">2. Botanical Ingredients Breakdown</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.botanicalIngredients?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.botanicalIngredients?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Classical herbs, Sanskrit nomenclature, and biochemical actions.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-charcoal">
                    <input
                      type="checkbox"
                      checked={formData.botanicalIngredients?.enabled !== false}
                      onChange={(e) => updateSectionEnabled('botanicalIngredients', e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('ingredients')}
                    className="p-1 text-charcoal-muted hover:text-forest"
                  >
                    {openSections.ingredients ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {openSections.ingredients && (
                <div className="p-4 pt-2 border-t border-sand-border/60 bg-sand/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Badge Tag</label>
                      <input
                        type="text"
                        value={formData.botanicalIngredients?.badge || ''}
                        onChange={(e) => updateSectionField('botanicalIngredients', 'badge', e.target.value)}
                        placeholder="e.g. What Goes Inside Every Bottle"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={formData.botanicalIngredients?.heading || ''}
                        onChange={(e) => updateSectionField('botanicalIngredients', 'heading', e.target.value)}
                        placeholder="e.g. The Botanical Powerhouse Behind the Results"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Intro Description</label>
                    <textarea
                      rows={2}
                      value={formData.botanicalIngredients?.description || ''}
                      onChange={(e) => updateSectionField('botanicalIngredients', 'description', e.target.value)}
                      placeholder="e.g. Each ingredient is selected based on classical Ayurvedic treatises..."
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                    />
                  </div>

                  {/* Herbs List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-forest uppercase tracking-wider">Herbal Actives ({(formData.botanicalIngredients?.herbs || []).length})</label>
                      <button
                        type="button"
                        onClick={handleAddHerb}
                        className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Herb</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(formData.botanicalIngredients?.herbs || []).map((herb, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-forest uppercase">Herb #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteHerb(idx)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Common Name</label>
                              <input
                                type="text"
                                value={herb.name || ''}
                                onChange={(e) => handleUpdateHerb(idx, 'name', e.target.value)}
                                placeholder="e.g. Amla (Gooseberry)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Sanskrit / Classical</label>
                              <input
                                type="text"
                                value={herb.sanskrit || ''}
                                onChange={(e) => handleUpdateHerb(idx, 'sanskrit', e.target.value)}
                                placeholder="e.g. Amalaki"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Therapeutic Role</label>
                              <input
                                type="text"
                                value={herb.role || ''}
                                onChange={(e) => handleUpdateHerb(idx, 'role', e.target.value)}
                                placeholder="e.g. Vitamin C & Cellular Immunity"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs text-brand font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Action / Benefits</label>
                            <textarea
                              rows={2}
                              value={herb.desc || ''}
                              onChange={(e) => handleUpdateHerb(idx, 'desc', e.target.value)}
                              placeholder="Describe pharmacological effect and physiological benefits..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Usage Instructions / Daily Protocol */}
            <div className="border border-sand-border rounded-2xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() => toggleAccordion('usage')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-sand/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-deep">3. Usage Instructions &amp; Daily Wellness Protocol</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.usageInstructions?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.usageInstructions?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Daily consumption steps, water dilution, and 90-day progress timeline.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-charcoal">
                    <input
                      type="checkbox"
                      checked={formData.usageInstructions?.enabled !== false}
                      onChange={(e) => updateSectionEnabled('usageInstructions', e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('usage')}
                    className="p-1 text-charcoal-muted hover:text-forest"
                  >
                    {openSections.usage ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {openSections.usage && (
                <div className="p-4 pt-2 border-t border-sand-border/60 bg-sand/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Badge Tag</label>
                      <input
                        type="text"
                        value={formData.usageInstructions?.badge || ''}
                        onChange={(e) => updateSectionField('usageInstructions', 'badge', e.target.value)}
                        placeholder="e.g. Daily Wellness Protocol"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={formData.usageInstructions?.heading || ''}
                        onChange={(e) => updateSectionField('usageInstructions', 'heading', e.target.value)}
                        placeholder="e.g. How to Consume for Maximum Therapeutic Results"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Instructions Intro</label>
                    <textarea
                      rows={2}
                      value={formData.usageInstructions?.description || ''}
                      onChange={(e) => updateSectionField('usageInstructions', 'description', e.target.value)}
                      placeholder="e.g. Consistency is key in Ayurvedic healing. Follow this simple 3-step ritual daily."
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                    />
                  </div>

                  {/* Daily Consumption Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-forest uppercase tracking-wider">Daily Protocol Steps</label>
                      <button
                        type="button"
                        onClick={handleAddUsageStep}
                        className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Step</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.usageInstructions?.steps || []).map((step, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1">
                            {step.stepNumber || idx + 1}
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={step.title || ''}
                              onChange={(e) => handleUpdateUsageStep(idx, 'title', e.target.value)}
                              placeholder="Step Title (e.g. Shake & Measure)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={step.description || ''}
                              onChange={(e) => handleUpdateUsageStep(idx, 'description', e.target.value)}
                              placeholder="Step instructions..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteUsageStep(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0"
                            title="Remove step"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 90-Day Course Progression Timeline */}
                  <div className="pt-3 border-t border-sand-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-forest uppercase">
                        <input
                          type="checkbox"
                          checked={formData.usageInstructions?.showProgression !== false}
                          onChange={(e) => updateSectionField('usageInstructions', 'showProgression', e.target.checked)}
                          className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                        />
                        <span>Enable Course Progression Timeline</span>
                      </label>
                      {formData.usageInstructions?.showProgression !== false && (
                        <button
                          type="button"
                          onClick={handleAddProgressionStage}
                          className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Milestone</span>
                        </button>
                      )}
                    </div>

                    {formData.usageInstructions?.showProgression !== false && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={formData.usageInstructions?.progressionHeading || ''}
                          onChange={(e) => updateSectionField('usageInstructions', 'progressionHeading', e.target.value)}
                          placeholder="Progression Heading (e.g. Your 90-Day Ayurvedic Course Progression)"
                          className="w-full px-3 py-1.5 rounded-xl border border-sand-border text-xs font-semibold bg-white"
                        />

                        <div className="space-y-2">
                          {(formData.usageInstructions?.progressionStages || []).map((stg, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  value={stg.stage || ''}
                                  onChange={(e) => handleUpdateProgressionStage(idx, 'stage', e.target.value)}
                                  placeholder="Timeline (e.g. Day 1 - 30 (Bottle 1))"
                                  className="w-1/2 px-2 py-1 rounded-lg border border-sand-border text-xs font-bold text-amber-700 bg-amber-50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProgressionStage(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove milestone"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={stg.title || ''}
                                onChange={(e) => handleUpdateProgressionStage(idx, 'title', e.target.value)}
                                placeholder="Milestone outcome title (e.g. Metabolic Detox & Cleansing)"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                              />
                              <textarea
                                rows={2}
                                value={stg.description || ''}
                                onChange={(e) => handleUpdateProgressionStage(idx, 'description', e.target.value)}
                                placeholder="Expected physiological and symptom changes..."
                                className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Product Comparison Table */}
            <div className="border border-sand-border rounded-2xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() => toggleAccordion('comparison')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-sand/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <TableIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-deep">4. Product Clinical Comparison Table</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.comparisonTable?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.comparisonTable?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Compare Fibax formulation standards against marketplace alternatives.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-charcoal">
                    <input
                      type="checkbox"
                      checked={formData.comparisonTable?.enabled !== false}
                      onChange={(e) => updateSectionEnabled('comparisonTable', e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('comparison')}
                    className="p-1 text-charcoal-muted hover:text-forest"
                  >
                    {openSections.comparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {openSections.comparison && (
                <div className="p-4 pt-2 border-t border-sand-border/60 bg-sand/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Badge Tag</label>
                      <input
                        type="text"
                        value={formData.comparisonTable?.badge || ''}
                        onChange={(e) => updateSectionField('comparisonTable', 'badge', e.target.value)}
                        placeholder="e.g. Clinical Comparison"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={formData.comparisonTable?.heading || ''}
                        onChange={(e) => updateSectionField('comparisonTable', 'heading', e.target.value)}
                        placeholder="e.g. Why Fibax Pharma Stands Out"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Competitor Header</label>
                      <input
                        type="text"
                        value={formData.comparisonTable?.competitorHeader || ''}
                        onChange={(e) => updateSectionField('comparisonTable', 'competitorHeader', e.target.value)}
                        placeholder="e.g. Conventional Market Products"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Description</label>
                    <textarea
                      rows={2}
                      value={formData.comparisonTable?.description || ''}
                      onChange={(e) => updateSectionField('comparisonTable', 'description', e.target.value)}
                      placeholder="e.g. See the tangible difference between authentic cold-pressed Ayurveda and typical marketplace brands."
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                    />
                  </div>

                  {/* Comparison Rows */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-forest uppercase tracking-wider">Comparison Metrics</label>
                      <button
                        type="button"
                        onClick={handleAddComparisonRow}
                        className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.comparisonTable?.rows || []).map((row, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-3">
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Feature / Standard</label>
                            <input
                              type="text"
                              value={row.feature || ''}
                              onChange={(e) => handleUpdateComparisonRow(idx, 'feature', e.target.value)}
                              placeholder="e.g. Extraction Technique"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[9px] text-forest font-bold uppercase">Fibax Advantage</label>
                            <input
                              type="text"
                              value={row.fibax || ''}
                              onChange={(e) => handleUpdateComparisonRow(idx, 'fibax', e.target.value)}
                              placeholder="e.g. Cold Decoction & Raw Swaras"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-forest/40 bg-forest/5 text-forest text-xs font-bold"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="block text-[9px] text-charcoal-muted font-bold uppercase">Competitor Standard</label>
                            <input
                              type="text"
                              value={row.competitor || ''}
                              onChange={(e) => handleUpdateComparisonRow(idx, 'competitor', e.target.value)}
                              placeholder="e.g. High-heat boiling"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteComparisonRow(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Delete row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 5: Frequently Asked Questions (FAQs) */}
            <div className="border border-sand-border rounded-2xl overflow-hidden bg-white shadow-xs">
              <div
                onClick={() => toggleAccordion('faqs')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-sand/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-deep">5. Frequently Asked Questions (FAQs)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.faqsConfig?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {formData.faqsConfig?.enabled !== false ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted">Product-specific answers on safety, duration, drug interaction, and usage.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-charcoal">
                    <input
                      type="checkbox"
                      checked={formData.faqsConfig?.enabled !== false}
                      onChange={(e) => updateSectionEnabled('faqsConfig', e.target.checked)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest cursor-pointer"
                    />
                    <span className="hidden sm:inline">Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('faqs')}
                    className="p-1 text-charcoal-muted hover:text-forest"
                  >
                    {openSections.faqs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {openSections.faqs && (
                <div className="p-4 pt-2 border-t border-sand-border/60 bg-sand/10 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Badge Tag</label>
                      <input
                        type="text"
                        value={formData.faqsConfig?.badge || ''}
                        onChange={(e) => updateSectionField('faqsConfig', 'badge', e.target.value)}
                        placeholder="e.g. Everything You Need to Know"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Main Heading</label>
                      <input
                        type="text"
                        value={formData.faqsConfig?.heading || ''}
                        onChange={(e) => updateSectionField('faqsConfig', 'heading', e.target.value)}
                        placeholder="e.g. Frequently Asked Questions"
                        className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-charcoal uppercase tracking-wider">Intro Description</label>
                    <textarea
                      rows={2}
                      value={formData.faqsConfig?.description || ''}
                      onChange={(e) => updateSectionField('faqsConfig', 'description', e.target.value)}
                      placeholder="e.g. Clear answers to common questions about usage, safety, and course length."
                      className="w-full px-3 py-2 rounded-xl border border-sand-border text-xs focus:ring-2 focus:ring-forest focus:outline-none bg-white"
                    />
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-forest uppercase tracking-wider">Questions &amp; Answers ({(formData.faqsConfig?.items || []).length})</label>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="text-xs text-forest font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.faqsConfig?.items || []).map((faq, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-sand-border space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-forest uppercase">FAQ #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(idx)}
                              className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={faq.q || ''}
                              onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                              placeholder="Question (e.g. Can I take this along with regular medicines?)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <textarea
                              rows={2}
                              value={faq.a || ''}
                              onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                              placeholder="Answer explanation..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-sand-border text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </form>

        {/* Modal Sticky Bottom Controls */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-sand-border bg-sand/30 backdrop-blur-xs flex items-center justify-between gap-2 sm:gap-4">
          <div className="text-xs text-charcoal-muted hidden sm:block">
            <span className="font-semibold text-forest">One-click save:</span> Basic details, pricing, images, and all 5 PDP sections persist together.
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-charcoal hover:bg-sand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-modal-form"
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{productToEdit ? 'Save Changes' : 'Publish Product to Store'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
