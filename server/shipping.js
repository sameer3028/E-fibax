import { getSingleton, setSingleton } from './store.js';

export const DEFAULT_SHIPPING_CONFIG = {
  provider: 'delhivery', // 'delhivery' | 'shiprocket' | 'auto'
  mode: 'production', // 'sandbox' | 'production'
  shippingRateMode: 'live', // 'live' | 'manual'
  autoAssignAWB: true,
  defaultCourier: 'Delhivery Express Surface & Air',
  freeShippingThreshold: 499,
  standardShippingFee: 59,
  codFee: 0,
  delhivery: {
    apiKey: '81ce45abd1b2943ead6fd99220fcb9da1ad368b8',
    clientName: 'FIBAX_AYURVEDA',
    pickupLocation: 'Fibax Central Fulfillment Hub'
  },
  shiprocket: {
    email: '',
    password: '',
    token: '',
    pickupLocation: 'Primary'
  },
  warehouse: {
    name: 'Fibax Ayurveda Central Logistics Hub',
    address: 'SCO 42, Sector 12, Chandigarh Tricity Logistics Corridor',
    city: 'Zirakpur',
    state: 'Punjab',
    pincode: '140603',
    phone: '+91-8872544458',
    email: 'care@fibaxpharma.com'
  }
};

// Seed the default shipping config on first boot if none is stored yet.
// Call after the storage layer has been initialized.
export function initShipping() {
  if (!getSingleton('shipping_config')) {
    setSingleton('shipping_config', { ...DEFAULT_SHIPPING_CONFIG });
  }
}

export function getShippingConfig() {
  const stored = getSingleton('shipping_config');
  return { ...DEFAULT_SHIPPING_CONFIG, ...(stored || {}) };
}

export function saveShippingConfig(newConfig) {
  const current = getShippingConfig();
  const updated = {
    ...current,
    ...newConfig,
    delhivery: { ...(current.delhivery || {}), ...(newConfig.delhivery || {}) },
    shiprocket: { ...(current.shiprocket || {}), ...(newConfig.shiprocket || {}) },
    warehouse: { ...(current.warehouse || {}), ...(newConfig.warehouse || {}) },
    updatedAt: new Date().toISOString()
  };
  setSingleton('shipping_config', updated);
  return updated;
}

export const PINCODE_CIRCLES = {
  '11': { state: 'Delhi', region: 'National Capital Region', transitDays: '1-2 business days' },
  '12': { state: 'Haryana', region: 'Gurugram / Faridabad / Ambala', transitDays: '1-2 business days' },
  '13': { state: 'Haryana', region: 'Karnal / Kurukshetra / Yamunanagar', transitDays: '1-2 business days' },
  '14': { state: 'Punjab', region: 'Chandigarh / Mohali / Ludhiana / Patiala', transitDays: '24-48 hours' },
  '15': { state: 'Punjab', region: 'Bathinda / Firozpur', transitDays: '1-2 business days' },
  '16': { state: 'Chandigarh', region: 'Chandigarh Tricity', transitDays: 'Same / Next Day' },
  '17': { state: 'Himachal Pradesh', region: 'Shimla / Solan / Kangra', transitDays: '2-3 business days' },
  '18': { state: 'Jammu & Kashmir', region: 'Jammu Circle', transitDays: '2-3 business days' },
  '19': { state: 'Jammu & Kashmir', region: 'Srinagar / Kashmir Circle', transitDays: '3-4 business days' },
  '20': { state: 'Uttar Pradesh', region: 'Noida / Ghaziabad / Meerut', transitDays: '1-2 business days' },
  '21': { state: 'Uttar Pradesh', region: 'Allahabad / Prayagraj', transitDays: '2-3 business days' },
  '22': { state: 'Uttar Pradesh', region: 'Lucknow / Faizabad', transitDays: '2-3 business days' },
  '23': { state: 'Uttar Pradesh', region: 'Varanasi / Mirzapur', transitDays: '2-3 business days' },
  '24': { state: 'Uttarakhand', region: 'Dehradun / Haridwar / Rishikesh', transitDays: '2-3 business days' },
  '25': { state: 'Uttar Pradesh', region: 'Muzaffarnagar / Saharanpur', transitDays: '1-2 business days' },
  '26': { state: 'Uttarakhand', region: 'Nainital / Haldwani', transitDays: '2-3 business days' },
  '27': { state: 'Uttar Pradesh', region: 'Gorakhpur / Basti', transitDays: '2-3 business days' },
  '28': { state: 'Uttar Pradesh', region: 'Agra / Jhansi / Mathura', transitDays: '2-3 business days' },
  '30': { state: 'Rajasthan', region: 'Jaipur Circle', transitDays: '2-3 business days' },
  '31': { state: 'Rajasthan', region: 'Udaipur / Ajmer', transitDays: '2-3 business days' },
  '32': { state: 'Rajasthan', region: 'Kota / Bharatpur', transitDays: '2-3 business days' },
  '33': { state: 'Rajasthan', region: 'Bikaner / Sikar', transitDays: '2-3 business days' },
  '34': { state: 'Rajasthan', region: 'Jodhpur / Barmer', transitDays: '2-3 business days' },
  '36': { state: 'Gujarat', region: 'Rajkot / Saurashtra', transitDays: '2-3 business days' },
  '37': { state: 'Gujarat', region: 'Kutch Circle', transitDays: '3-4 business days' },
  '38': { state: 'Gujarat', region: 'Ahmedabad / Gandhinagar', transitDays: '2-3 business days' },
  '39': { state: 'Gujarat', region: 'Surat / Vadodara', transitDays: '2-3 business days' },
  '40': { state: 'Maharashtra', region: 'Mumbai / Thane / Navi Mumbai', transitDays: '2-3 business days' },
  '41': { state: 'Maharashtra', region: 'Pune / Nashik / Kolhapur', transitDays: '2-3 business days' },
  '42': { state: 'Maharashtra', region: 'Kalyan / Jalgaon', transitDays: '2-3 business days' },
  '43': { state: 'Maharashtra', region: 'Aurangabad / Nanded', transitDays: '2-3 business days' },
  '44': { state: 'Maharashtra', region: 'Nagpur / Amravati', transitDays: '2-3 business days' },
  '45': { state: 'Madhya Pradesh', region: 'Indore / Ujjain', transitDays: '2-3 business days' },
  '46': { state: 'Madhya Pradesh', region: 'Bhopal / Hoshangabad', transitDays: '2-3 business days' },
  '47': { state: 'Madhya Pradesh', region: 'Gwalior / Morena', transitDays: '2-3 business days' },
  '48': { state: 'Madhya Pradesh', region: 'Jabalpur / Sagar', transitDays: '2-3 business days' },
  '49': { state: 'Chhattisgarh', region: 'Raipur / Bilaspur', transitDays: '3-4 business days' },
  '50': { state: 'Telangana', region: 'Hyderabad / Secunderabad', transitDays: '2-3 business days' },
  '51': { state: 'Andhra Pradesh', region: 'Tirupati / Kurnool', transitDays: '3-4 business days' },
  '52': { state: 'Andhra Pradesh', region: 'Vijayawada / Guntur', transitDays: '3-4 business days' },
  '53': { state: 'Andhra Pradesh', region: 'Visakhapatnam / Kakinada', transitDays: '3-4 business days' },
  '56': { state: 'Karnataka', region: 'Bengaluru / Kolar', transitDays: '2-3 business days' },
  '57': { state: 'Karnataka', region: 'Mangalore / Udupi', transitDays: '3-4 business days' },
  '58': { state: 'Karnataka', region: 'Hubli / Belgaum', transitDays: '3-4 business days' },
  '59': { state: 'Karnataka', region: 'Gulbarga / Bellary', transitDays: '3-4 business days' },
  '60': { state: 'Tamil Nadu', region: 'Chennai Circle', transitDays: '2-3 business days' },
  '61': { state: 'Tamil Nadu', region: 'Tiruchirappalli / Thanjavur', transitDays: '3-4 business days' },
  '62': { state: 'Tamil Nadu', region: 'Madurai / Tirunelveli', transitDays: '3-4 business days' },
  '63': { state: 'Tamil Nadu', region: 'Salem / Vellore', transitDays: '3-4 business days' },
  '64': { state: 'Tamil Nadu', region: 'Coimbatore / Erode', transitDays: '3-4 business days' },
  '67': { state: 'Kerala', region: 'Kozhikode / Kannur', transitDays: '3-4 business days' },
  '68': { state: 'Kerala', region: 'Kochi / Ernakulam / Thrissur', transitDays: '3-4 business days' },
  '69': { state: 'Kerala', region: 'Thiruvananthapuram / Kollam', transitDays: '3-4 business days' },
  '70': { state: 'West Bengal', region: 'Kolkata Metropolitan', transitDays: '2-3 business days' },
  '71': { state: 'West Bengal', region: 'Howrah / Hooghly', transitDays: '2-3 business days' },
  '72': { state: 'West Bengal', region: 'Midnapore / Bankura', transitDays: '3-4 business days' },
  '73': { state: 'West Bengal', region: 'Siliguri / Jalpaiguri', transitDays: '3-4 business days' },
  '74': { state: 'West Bengal', region: 'Malda / Murshidabad', transitDays: '3-4 business days' },
  '75': { state: 'Odisha', region: 'Bhubaneswar / Cuttack', transitDays: '3-4 business days' },
  '76': { state: 'Odisha', region: 'Berhampur / Puri', transitDays: '3-4 business days' },
  '77': { state: 'Odisha', region: 'Rourkela / Sambalpur', transitDays: '3-4 business days' },
  '78': { state: 'Assam', region: 'Guwahati / Dibrugarh', transitDays: '3-5 business days' },
  '79': { state: 'North East', region: 'Shillong / Imphal / Agartala / Aizawl', transitDays: '4-6 business days' },
  '80': { state: 'Bihar', region: 'Patna / Nalanda', transitDays: '2-4 business days' },
  '81': { state: 'Bihar', region: 'Bhagalpur / Munger', transitDays: '3-4 business days' },
  '82': { state: 'Bihar', region: 'Gaya / Nawada', transitDays: '3-4 business days' },
  '83': { state: 'Jharkhand', region: 'Ranchi / Jamshedpur', transitDays: '3-4 business days' },
  '84': { state: 'Bihar', region: 'Muzaffarpur / Darbhanga', transitDays: '3-4 business days' },
  '85': { state: 'Bihar', region: 'Purnia / Saharsa', transitDays: '3-5 business days' }
};

export async function checkPincodeServiceability(pincode) {
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
  if (cleanPin.length !== 6) {
    return {
      serviceable: false,
      pincode: cleanPin,
      error: 'Please enter a valid 6-digit Indian PIN code.'
    };
  }

  const prefix = cleanPin.substring(0, 2);
  const fallbackCircle = PINCODE_CIRCLES[prefix] || {
    state: 'India',
    region: 'Standard Delivery Zone',
    transitDays: '2-4 business days'
  };

  const config = getShippingConfig();
  const apiKey = config.delhivery?.apiKey || '81ce45abd1b2943ead6fd99220fcb9da1ad368b8';

  let delhiveryData = null;
  if (apiKey) {
    try {
      const resp = await fetch(`https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${cleanPin}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json?.delivery_codes && json.delivery_codes.length > 0) {
          delhiveryData = json.delivery_codes[0].postal_code;
        }
      }
    } catch (err) {
      console.warn('Delhivery live pincode check error, using fallback:', err.message);
    }
  }

  const availableCouriers = [
    { name: 'Delhivery Express Air & Surface', code: 'DELHIVERY', cod: true, fast: true },
    { name: 'Blue Dart Express', code: 'BLUEDART', cod: true, fast: true },
    { name: 'Shadowfax E-Commerce', code: 'SHADOWFAX', cod: true, fast: false }
  ];

  if (delhiveryData) {
    const isServiceable = delhiveryData.pre_paid === 'Y' || delhiveryData.cod === 'Y';
    const city = delhiveryData.city || delhiveryData.district || fallbackCircle.region;
    const state = delhiveryData.state_code || fallbackCircle.state;
    const codAvailable = delhiveryData.cod === 'Y';
    const prepaidAvailable = delhiveryData.pre_paid === 'Y';
    const estTransit = delhiveryData.sun_tat ? '1-3 business days' : (fallbackCircle.transitDays || '2-4 business days');

    return {
      serviceable: isServiceable,
      pincode: cleanPin,
      city,
      district: delhiveryData.district || city,
      state,
      circle: `${city}, ${state}`,
      courier: 'Delhivery Express Surface & Air',
      estimatedDays: estTransit,
      codAvailable,
      prepaidAvailable,
      freeDeliveryEligible: true,
      freeShippingThreshold: config.freeShippingThreshold || 499,
      couriers: availableCouriers,
      dispatchWarehouse: config.warehouse?.city || 'Zirakpur, Punjab',
      liveVerified: true,
      delhiveryRaw: {
        center: delhiveryData.center?.[0]?.cn || '',
        sortCode: delhiveryData.sort_code || '',
        isOda: delhiveryData.is_oda === 'Y'
      }
    };
  }

  // Fallback if offline or fallback circle
  return {
    serviceable: true,
    pincode: cleanPin,
    state: fallbackCircle.state,
    region: fallbackCircle.region,
    city: fallbackCircle.region.split('/')[0].trim(),
    circle: `${fallbackCircle.region}, ${fallbackCircle.state}`,
    courier: 'Delhivery Express Surface & Air',
    estimatedDays: fallbackCircle.transitDays,
    codAvailable: true,
    prepaidAvailable: true,
    freeDeliveryEligible: true,
    freeShippingThreshold: config.freeShippingThreshold || 499,
    couriers: availableCouriers,
    dispatchWarehouse: config.warehouse?.city || 'Zirakpur, Punjab',
    liveVerified: false
  };
}

export async function calculateShippingFee({ cartTotal = 0, pincode = '', paymentMethod = 'COD', weight = 500, items = [], productsList = [], combosList = [] }) {
  const config = getShippingConfig();
  const threshold = config.freeShippingThreshold || 499;
  const isFree = Number(cartTotal) >= threshold;
  const shippingRateMode = config.shippingRateMode || 'live'; // 'live' | 'manual'

  let liveRate = null;
  let rateError = null;
  const cleanPin = String(pincode || '').trim().replace(/\D/g, '');
  const apiKey = config.delhivery?.apiKey || '81ce45abd1b2943ead6fd99220fcb9da1ad368b8';
  const originPin = config.warehouse?.pincode || '140603';

  // Authoritative item package validation and total weight calculation
  let calculatedWeightGrams = 0;
  let missingItemName = null;

  if (Array.isArray(items) && items.length > 0) {
    const allProducts = Array.isArray(productsList) ? productsList : [];
    const allCombos = Array.isArray(combosList) ? combosList : [];

    for (const item of items) {
      const qty = Number(item.quantity) || 1;
      const itemId = String(item.id || item.product?.id || '');

      let itemData = null;
      if (item.isCombo || item.categoryId === 'combos') {
        itemData = allCombos.find(c => String(c.id) === itemId) || allProducts.find(p => String(p.id) === itemId);
      } else {
        itemData = allProducts.find(p => String(p.id) === itemId) || item.product;
      }

      const title = itemData?.title || item.title || item.name || 'product';

      const pkg = itemData?.shippingPackage || {};
      const wGrams = Number(pkg.weightGrams !== undefined ? pkg.weightGrams : (itemData?.packageWeightGrams || 0));
      const lCm = Number(pkg.lengthCm !== undefined ? pkg.lengthCm : (itemData?.packageLengthCm || 0));
      const wCm = Number(pkg.widthCm !== undefined ? pkg.widthCm : (itemData?.packageWidthCm || 0));
      const hCm = Number(pkg.heightCm !== undefined ? pkg.heightCm : (itemData?.packageHeightCm || 0));

      // Missing data check: All 4 package fields must be positive numbers (> 0)
      if (wGrams <= 0 || lCm <= 0 || wCm <= 0 || hCm <= 0) {
        missingItemName = title;
        break;
      }

      let packMultiplier = 1;
      if (item.selectedPackQty && Number(item.selectedPackQty) > 0) {
        packMultiplier = Number(item.selectedPackQty);
      }

      calculatedWeightGrams += (wGrams * packMultiplier) * qty;
    }
  }

  // If any item in cart is missing valid package weight/dimensions
  if (missingItemName) {
    return {
      cartTotal: Number(cartTotal),
      isFreeShipping: isFree,
      amountNeededForFreeShipping: isFree ? 0 : Math.max(0, threshold - Number(cartTotal)),
      shippingFee: 0,
      codFee: 0,
      totalShipping: 0,
      liveRate: null,
      delhiveryCharge: 0,
      rateMode: shippingRateMode,
      calculationFailed: true,
      missingShippingData: true,
      affectedProduct: missingItemName,
      error: `Shipping package details are missing for "${missingItemName}". Please configure package weight and dimensions in Admin.`
    };
  }

  const finalShipmentWeightGrams = calculatedWeightGrams > 0 ? calculatedWeightGrams : Number(weight || 500);

  if (!isFree && cleanPin.length === 6 && apiKey && shippingRateMode === 'live') {
    try {
      const pt = paymentMethod === 'COD' ? 'COD' : 'Pre-paid';
      const rateUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${cleanPin}&o_pin=${originPin}&cgm=${finalShipmentWeightGrams}&pt=${pt}`;
      const resp = await fetch(rateUrl, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        const itemsList = Array.isArray(data) ? data : (data?.value && Array.isArray(data.value) ? data.value : []);
        if (itemsList.length > 0 && (itemsList[0]?.total_amount !== undefined && itemsList[0]?.total_amount !== null)) {
          const item = itemsList[0];
          liveRate = {
            totalAmount: Number(item.total_amount),
            grossAmount: Number(item.gross_amount || item.total_amount),
            zone: item.zone || 'Standard',
            courierCharge: Number(item.charge_DL || 0),
            codCharge: Number(item.charge_COD || 0),
            tax: item.tax_data || {}
          };
        } else {
          rateError = 'Delhivery rate API did not return valid rate data.';
        }
      } else {
        rateError = `Delhivery rate API returned HTTP status ${resp.status}.`;
      }
    } catch (err) {
      console.warn('Delhivery live rate calculation error:', err.message);
      rateError = err.message;
    }
  }

  let finalShippingFee = 0;
  let calculationFailed = false;

  if (isFree) {
    finalShippingFee = 0;
  } else if (liveRate) {
    // Exact rounded Delhivery live calculated rate
    finalShippingFee = Math.round(liveRate.totalAmount);
  } else if (shippingRateMode === 'manual') {
    finalShippingFee = config.standardShippingFee || 59;
  } else {
    // Live rate calculation attempted but failed or PIN not provided yet
    calculationFailed = true;
    finalShippingFee = 0;
  }

  const codFee = (paymentMethod === 'COD' && config.codFee > 0) ? config.codFee : 0;

  return {
    cartTotal: Number(cartTotal),
    isFreeShipping: isFree,
    amountNeededForFreeShipping: isFree ? 0 : Math.max(0, threshold - Number(cartTotal)),
    shippingFee: finalShippingFee,
    codFee,
    totalShipping: finalShippingFee + codFee,
    liveRate: liveRate || null,
    delhiveryCharge: liveRate ? Math.round(liveRate.totalAmount) : (isFree ? 0 : (config.standardShippingFee || 59)),
    rateMode: shippingRateMode,
    calculationFailed,
    error: calculationFailed ? (rateError || 'Unable to calculate live shipping rate for PIN code.') : null
  };
}

export function createFallbackShipment(order, options = {}) {
  const config = getShippingConfig();
  const provider = options.provider || config.provider || 'delhivery';
  const courierName = options.courier || config.defaultCourier || 'Delhivery Express';

  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  let awb = '';
  if (provider === 'shiprocket') {
    awb = 'SR-' + randomDigits;
  } else if (provider === 'bluedart') {
    awb = 'BD-' + randomDigits;
  } else {
    awb = 'DLH-' + randomDigits;
  }

  const now = new Date();
  const estDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const initialTimeline = [
    {
      status: 'Order Placed',
      title: 'Order Confirmed & Verified',
      location: 'Fibax Digital Storefront',
      timestamp: order.createdAt || now.toISOString(),
      completed: true,
      description: 'Customer order placed successfully. Payment: ' + (order.payment?.method || 'COD')
    },
    {
      status: 'Manifested',
      title: 'Packed & Manifest Generated',
      location: (config.warehouse?.city || 'Zirakpur') + ' Hub',
      timestamp: now.toISOString(),
      completed: true,
      description: 'AWB ' + awb + ' generated. Formulations securely packed with tamper-evident seal.'
    },
    {
      status: 'Dispatched',
      title: 'Handed Over to Courier',
      location: courierName + ' Tricity Sorting Center',
      timestamp: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      completed: false,
      description: 'Package handed to ' + courierName + ' dispatch executive.'
    },
    {
      status: 'In Transit',
      title: 'In Transit to Destination Hub',
      location: 'National Highway Express Route',
      timestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      description: 'Air/Surface cargo en route to regional delivery hub.'
    },
    {
      status: 'Out for Delivery',
      title: 'Out for Doorstep Delivery',
      location: (order.shipping?.city || 'Destination') + ' Hub',
      timestamp: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      completed: false,
      description: 'Delivery associate assigned for doorstep handover.'
    },
    {
      status: 'Delivered',
      title: 'Delivered to Consignee',
      location: order.shipping?.address || 'Consignee Address',
      timestamp: estDate.toISOString(),
      completed: false,
      description: 'Package delivered safely. OTP verified.'
    }
  ];

  return {
    orderId: order.orderId,
    trackingId: awb,
    courier: courierName,
    provider,
    status: 'Manifested',
    shippedAt: now.toISOString(),
    estimatedDelivery: estDate.toISOString(),
    pickupWarehouse: config.warehouse,
    destination: {
      name: order.customer?.name || 'Customer',
      phone: order.customer?.phone || '',
      address: order.shipping?.address || '',
      city: order.shipping?.city || '',
      pincode: order.shipping?.pincode || ''
    },
    payment: {
      method: order.payment?.method || 'COD',
      collectableAmount: order.payment?.method === 'COD' ? (order.totals?.grandTotal || 0) : 0
    },
    timeline: initialTimeline
  };
}

export const createShipmentForOrder = createFallbackShipment;

export async function createDelhiveryShipment(order, options = {}) {
  // CANCELLED GUARD: Do not ship cancelled orders
  if (order.status === 'Cancelled' || order.shipment?.cancelled === true) {
    return { success: false, error: 'Cancelled orders cannot be shipped' };
  }

  const config = getShippingConfig();
  const apiKey = config.delhivery?.apiKey;
  const mode = config.mode || 'production';
  const pickupLocation = config.delhivery?.pickupLocation || 'Fibax Central Fulfillment Hub';
  
  // Determine endpoint based on mode
  const baseUrl = mode === 'sandbox' 
    ? 'https://staging-express.delhivery.com'
    : 'https://track.delhivery.com';
  
  // IDEMPOTENCY CHECK: If order already has a real Delhivery AWB, don't create again
  if (order.delhiveryAwb || (order.trackingId && !order.trackingId.startsWith('DLH-'))) {
    return { success: false, error: 'Shipment already created', existingAwb: order.delhiveryAwb || order.trackingId };
  }
  
  // Build shipment payload from actual order data
  const isCod = order.payment?.method === 'COD';
  const codAmount = isCod ? (order.totals?.grandTotal || 0) : 0;
  
  // Calculate total weight from order items
  let totalWeightGrams = 0;
  (order.items || []).forEach(item => {
    const pkg = item.shippingPackage || item.product?.shippingPackage || {};
    const wg = Number(pkg.weightGrams || item.packageWeightGrams || 0);
    const qty = Number(item.quantity || 1);
    totalWeightGrams += wg * qty;
  });
  if (totalWeightGrams <= 0) totalWeightGrams = 500; // Default 500g if missing
  
  const productDesc = (order.items || []).map(it => `${it.quantity}x ${it.title}`).join(', ') || 'Ayurvedic Formulations';
  
  const shipment = {
    name: order.customer?.name || 'Customer',
    add: order.shipping?.address || '',
    pin: String(order.shipping?.pincode || ''),
    city: order.shipping?.city || '',
    state: order.shipping?.state || '',
    country: 'India',
    phone: String(order.customer?.phone || '').replace(/[^0-9]/g, ''),
    order: order.orderId,
    payment_mode: isCod ? 'COD' : 'Prepaid',
    return_pin: config.warehouse?.pincode || '140603',
    return_city: config.warehouse?.city || 'Zirakpur',
    return_phone: String(config.warehouse?.phone || '').replace(/[^0-9]/g, ''),
    return_add: config.warehouse?.address || '',
    return_state: config.warehouse?.state || 'Punjab',
    return_country: 'India',
    return_name: config.warehouse?.name || 'Fibax Ayurveda',
    products_desc: productDesc,
    hsn_code: '',
    cod_amount: String(codAmount),
    order_date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    total_amount: String(order.totals?.grandTotal || 0),
    seller_add: config.warehouse?.address || '',
    seller_name: config.warehouse?.name || 'Fibax Ayurveda',
    seller_inv: order.orderId,
    quantity: String((order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)),
    weight: String(totalWeightGrams),
    waybill: '',
    shipment_width: '',
    shipment_height: '',
    shipment_length: ''
  };
  
  const payload = {
    shipments: [shipment],
    pickup_location: { name: pickupLocation }
  };
  
  try {
    const url = `${baseUrl}/api/cmu/create.json`;
    const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;
    
    console.log(`🚚 Creating Delhivery shipment for order ${order.orderId}...`);
    console.log(`   Endpoint: ${url}`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Payment: ${isCod ? 'COD ₹' + codAmount : 'Prepaid'}`);
    console.log(`   Weight: ${totalWeightGrams}g`);
    console.log(`   Destination: ${order.shipping?.city} - ${order.shipping?.pincode}`);
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body
    });
    
    const responseText = await resp.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      console.error('Delhivery API returned non-JSON response:', responseText.substring(0, 500));
      return { success: false, error: 'Delhivery API returned an invalid response. Please check credentials and try again.' };
    }
    
    console.log(`   Delhivery HTTP Status: ${resp.status}`);
    console.log(`   Response success: ${responseData.success}`);
    
    if (!resp.ok) {
      const errorMsg = responseData.rmk || responseData.error || responseData.message || `HTTP ${resp.status}`;
      console.error(`   ❌ Delhivery shipment creation failed: ${errorMsg}`);
      return { success: false, error: `Delhivery API error: ${errorMsg}`, httpStatus: resp.status };
    }
    
    const packages = responseData.packages || [];
    const uploadWbn = responseData.upload_wbn || '';
    
    if (packages.length > 0) {
      const pkg = packages[0];
      const awb = pkg.waybill || '';
      const pkgStatus = pkg.status || '';
      const remarks = pkg.remarks || [];
      
      if (awb) {
        console.log(`   ✅ Delhivery AWB assigned: ${awb}`);
        return {
          success: true,
          awb,
          waybill: awb,
          shipmentId: uploadWbn,
          status: pkgStatus || 'Manifested',
          remarks,
          refnum: pkg.refnum || order.orderId,
          courier: config.defaultCourier || 'Delhivery Express',
          provider: 'delhivery',
          pickupLocation,
          mode,
          createdAt: new Date().toISOString(),
          rawResponse: { success: responseData.success, cash_pickups: responseData.cash_pickups, packages_count: packages.length }
        };
      } else {
        const reasonStr = remarks.join('; ') || pkgStatus || 'Unknown reason';
        console.error(`   ❌ No AWB assigned. Reason: ${reasonStr}`);
        return { success: false, error: `Delhivery did not assign AWB: ${reasonStr}`, remarks };
      }
    } else {
      const rmk = responseData.rmk || 'No packages returned in response';
      console.error(`   ❌ No packages in Delhivery response: ${rmk}`);
      return { success: false, error: `Delhivery response error: ${rmk}` };
    }
  } catch (err) {
    console.error(`   ❌ Delhivery API call failed:`, err.message);
    return { success: false, error: `Delhivery API connection error: ${err.message}` };
  }
}

// Real Delhivery Order Cancellation API
export async function cancelDelhiveryShipment(awb, reason = 'Customer requested cancellation') {
  if (!awb) return { success: false, error: 'No AWB provided for cancellation' };

  const config = getShippingConfig();
  const apiKey = config.delhivery?.apiKey;
  const mode = config.mode || 'production';
  const baseUrl = mode === 'sandbox'
    ? 'https://staging-express.delhivery.com'
    : 'https://track.delhivery.com';

  const cleanAwb = String(awb).replace(/[^0-9a-zA-Z]/g, '');

  try {
    const url = `${baseUrl}/api/p/edit`;
    console.log(`❌ Cancelling Delhivery shipment AWB ${cleanAwb}...`);

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        waybill: cleanAwb,
        cancellation: 'true',
        cancellation_reason: reason
      })
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { text };
    }

    console.log(`   Delhivery Cancellation Status: HTTP ${resp.status}`, data);

    if (resp.ok && (data.status === true || data.success === true || data.status === 'SUCCESS' || data.remark?.toLowerCase().includes('cancel'))) {
      return { success: true, awb: cleanAwb, remark: data.remark || 'Shipment has been cancelled.', rawResponse: data };
    } else {
      const msg = data.remark || data.error || data.message || data.detail || `HTTP ${resp.status}`;
      return { success: false, error: msg, rawResponse: data };
    }
  } catch (err) {
    console.error('Delhivery cancellation error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function requestDelhiveryPickup(order, config = null) {
  // PICKUP PROTECTION: Never add cancelled orders to a pickup request
  if (order.status === 'Cancelled' || order.shipment?.cancelled === true) {
    console.log(`⛔ Pickup request skipped for cancelled order ${order.orderId}`);
    return { success: false, error: 'Cancelled orders cannot be added to a pickup request' };
  }

  config = config || getShippingConfig();
  const apiKey = config.delhivery?.apiKey;
  const mode = config.mode || 'production';
  const baseUrl = mode === 'sandbox'
    ? 'https://staging-express.delhivery.com'
    : 'https://track.delhivery.com';
  const pickupLocation = config.delhivery?.pickupLocation || 'Fibax Central Fulfillment Hub';

  const now = new Date();
  const pickupDate = now.toISOString().split('T')[0];
  const pickupTime = `${String(now.getHours() + 2).padStart(2, '0')}:00:00`;
  
  try {
    const body = new URLSearchParams({
      pickup_time: pickupTime,
      pickup_date: pickupDate,
      pickup_location: pickupLocation,
      expected_package_count: '1'
    });
    
    const resp = await fetch(`${baseUrl}/fm/request/new/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
    
    const data = await resp.json().catch(() => ({}));
    console.log(`📦 Pickup request for ${order.orderId}: HTTP ${resp.status}`, data);
    return { success: resp.ok, pickupData: data };
  } catch (err) {
    console.warn('Pickup request error (non-critical):', err.message);
    return { success: false, error: err.message };
  }
}

const DELHIVERY_STATUS_MAP = {
  'Manifested': 'Manifested',
  'In Transit': 'In Transit',
  'Dispatched': 'In Transit',
  'Pending': 'Processing',
  'Out for Delivery': 'Out for Delivery',
  'Out For Delivery': 'Out for Delivery',
  'Delivered': 'Delivered',
  'RTO Initiated': 'RTO',
  'Returned': 'Returned',
  'Not Picked': 'Ready to Ship',
  'Picked Up': 'In Transit'
};

export function mapDelhiveryStatus(rawStatus) {
  if (!rawStatus) return 'Processing';
  const normalized = rawStatus.trim();
  if (DELHIVERY_STATUS_MAP[normalized]) return DELHIVERY_STATUS_MAP[normalized];
  const lower = normalized.toLowerCase();
  if (lower.includes('delivered')) return 'Delivered';
  if (lower.includes('out for delivery')) return 'Out for Delivery';
  if (lower.includes('transit') || lower.includes('dispatched')) return 'In Transit';
  if (lower.includes('rto') || lower.includes('return')) return 'RTO';
  if (lower.includes('manifest')) return 'Manifested';
  if (lower.includes('picked')) return 'In Transit';
  return 'In Transit';
}

export async function syncOrderTracking(order) {
  const awb = order.delhiveryAwb || order.trackingId;
  if (!awb) return { success: false, error: 'No AWB to track' };
  
  const config = getShippingConfig();
  const apiKey = config.delhivery?.apiKey;
  if (!apiKey) return { success: false, error: 'No API key configured' };
  
  const cleanAwb = awb.replace(/[^0-9a-zA-Z]/g, '');
  
  try {
    const resp = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${cleanAwb}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!resp.ok) return { success: false, error: `Tracking API HTTP ${resp.status}` };
    
    const json = await resp.json();
    if (!json?.ShipmentData?.length) return { success: false, error: 'No tracking data found' };
    
    const shipment = json.ShipmentData[0].Shipment;
    const rawStatus = shipment?.Status?.Status || '';
    const mappedStatus = mapDelhiveryStatus(rawStatus);
    const scans = shipment?.Scans || [];
    
    const trackingEvents = scans.map(s => {
      const d = s.ScanDetail || {};
      return {
        status: d.Scan || rawStatus,
        location: d.ScannedLocation || '',
        remark: d.Instructions || '',
        timestamp: d.ScanDateTime || '',
        source: 'DELHIVERY'
      };
    });
    
    return {
      success: true,
      status: mappedStatus,
      rawStatus,
      location: shipment?.Status?.StatusLocation || '',
      estimatedDelivery: shipment?.ExpectedDeliveryDate || null,
      trackingEvents,
      lastSyncedAt: new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getTrackingDetails(identifier, orders = []) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toUpperCase();
  const config = getShippingConfig();
  const apiKey = config.delhivery?.apiKey || '81ce45abd1b2943ead6fd99220fcb9da1ad368b8';

  const order = orders.find(o => 
    (o.orderId && o.orderId.toUpperCase() === cleanId) ||
    (o.trackingId && o.trackingId.toUpperCase() === cleanId)
  );

  const waybill = order ? (order.trackingId || order.orderId) : cleanId;

  // Query live Delhivery tracking API
  let liveDelhiveryData = null;
  if (apiKey && waybill) {
    try {
      const cleanAwb = waybill.replace(/[^0-9a-zA-Z]/g, '');
      const resp = await fetch(`https://track.delhivery.com/api/v1/packages/json/?waybill=${cleanAwb}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json?.ShipmentData && Array.isArray(json.ShipmentData) && json.ShipmentData.length > 0) {
          liveDelhiveryData = json.ShipmentData[0].Shipment;
        }
      }
    } catch (err) {
      console.warn('Delhivery live tracking lookup error:', err.message);
    }
  }

  // If live Delhivery data was found
  if (liveDelhiveryData) {
    const rawStatus = liveDelhiveryData.Status?.Status || 'In Transit';
    const scans = liveDelhiveryData.Scans || [];
    const formattedTimeline = scans.map((s, idx) => {
      const detail = s.ScanDetail || {};
      return {
        status: detail.Scan || rawStatus,
        title: detail.Instructions || detail.Scan || 'Checkpoint Cleared',
        location: detail.ScannedLocation || liveDelhiveryData.Status?.StatusLocation || 'Delhivery Hub',
        timestamp: detail.ScanDateTime || detail.StatusDateTime || new Date().toISOString(),
        completed: true,
        current: idx === 0,
        description: detail.Instructions || `Scanned at ${detail.ScannedLocation || 'hub'}`
      };
    });

    let activeStep = 3;
    if (rawStatus.toLowerCase().includes('delivered')) activeStep = 6;
    else if (rawStatus.toLowerCase().includes('out for delivery')) activeStep = 5;
    else if (rawStatus.toLowerCase().includes('transit')) activeStep = 4;
    else if (rawStatus.toLowerCase().includes('dispatched') || rawStatus.toLowerCase().includes('in transit')) activeStep = 3;
    else activeStep = 2;

    return {
      orderId: order?.orderId || ('FBX-' + (liveDelhiveryData.ReferenceNo || cleanId)),
      trackingId: liveDelhiveryData.AWB || waybill,
      courier: 'Delhivery Express Surface & Air (Live)',
      status: rawStatus,
      activeStep,
      totalSteps: 6,
      createdAt: order?.createdAt || liveDelhiveryData.PickUpDate || new Date().toISOString(),
      estimatedDelivery: liveDelhiveryData.ExpectedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        name: order?.customer?.name || liveDelhiveryData.Consignee?.Name || 'Customer',
        city: order?.shipping?.city || liveDelhiveryData.Destination || '',
        pincode: order?.shipping?.pincode || liveDelhiveryData.Consignee?.PinCode || '',
        address: order?.shipping?.address || liveDelhiveryData.Consignee?.Address1 || ''
      },
      items: order?.items || [],
      payment: order?.payment || { method: 'Prepaid / Verified' },
      totals: order?.totals || {},
      timeline: formattedTimeline.length > 0 ? formattedTimeline : (order?.shipment?.timeline || []),
      warehouse: config.warehouse,
      liveDelhivery: true
    };
  }

  if (!order) return null;

  let timeline = order.shipment?.timeline;
  if (!timeline || !Array.isArray(timeline)) {
    const shipmentData = createShipmentForOrder(order);
    timeline = shipmentData.timeline;
  }

  const status = order.status || 'Processing';
  let activeStep = 1;
  if (status === 'Delivered') activeStep = 6;
  else if (status === 'Out for Delivery') activeStep = 5;
  else if (status === 'In Transit') activeStep = 4;
  else if (status === 'Dispatched') activeStep = 3;
  else if (status === 'Manifested' || status === 'Processing') activeStep = 2;
  else activeStep = 1;

  const updatedTimeline = timeline.map((step, idx) => ({
    ...step,
    completed: idx < activeStep,
    current: idx === activeStep - 1
  }));

  return {
    orderId: order.orderId,
    trackingId: order.trackingId || order.delhiveryAwb || null,
    courier: order.courier || config.defaultCourier || 'Delhivery Express',
    status: order.status || 'Processing',
    activeStep,
    totalSteps: 6,
    createdAt: order.createdAt,
    estimatedDelivery: order.shipment?.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    customer: {
      name: order.customer?.name || 'Customer',
      city: order.shipping?.city || order.customer?.city || '',
      pincode: order.shipping?.pincode || '',
      address: order.shipping?.address || ''
    },
    items: order.items || [],
    payment: order.payment || { method: 'COD' },
    totals: order.totals || {},
    timeline: updatedTimeline,
    warehouse: config.warehouse,
    liveDelhivery: false
  };
}

export function generatePrintableLabel(order) {
  const config = getShippingConfig();
  const awb = order.trackingId || order.delhiveryAwb || order.orderId;
  const orderId = order.orderId || 'FBX-ORDER';
  const isCod = order.payment?.method === 'COD';
  const codAmount = isCod ? (order.totals?.grandTotal || 0) : 0;
  const itemsSummary = (order.items || []).map(it => it.quantity + 'x ' + it.title).join(', ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Shipping Label - ${orderId}</title>
  <style>
    body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 20px; background: #fff; color: #000; }
    .label { max-width: 440px; border: 2px solid #000; padding: 15px; margin: auto; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
    .courier-title { font-size: 20px; font-weight: bold; text-transform: uppercase; }
    .awb-box { text-align: center; background: #eee; padding: 6px; font-size: 16px; font-weight: bold; letter-spacing: 2px; border: 1px dashed #000; margin: 8px 0; }
    .barcode { font-size: 32px; letter-spacing: 6px; text-align: center; margin: 6px 0; font-family: monospace; }
    .section { border-bottom: 1px solid #000; padding: 8px 0; font-size: 12px; line-height: 1.4; }
    .cod-banner { background: #000; color: #fff; font-size: 15px; font-weight: bold; text-align: center; padding: 8px; margin: 10px 0; }
    .prepaid-banner { border: 2px solid #000; font-size: 14px; font-weight: bold; text-align: center; padding: 6px; margin: 10px 0; }
    .details-table { width: 100%; font-size: 11px; margin-top: 8px; border-collapse: collapse; }
    .details-table td { padding: 4px; border: 1px solid #ccc; }
    .footer { text-align: center; font-size: 10px; margin-top: 10px; color: #555; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 15px;">
    <button onclick="window.print()" style="padding: 10px 24px; background: #1b4332; color: #fff; border: none; font-weight: bold; cursor: pointer; border-radius: 8px; font-size: 14px;">Print Label (Thermal / A4)</button>
  </div>
  <div class="label">
    <div class="header">
      <div class="courier-title">${order.courier || 'Delhivery Express'}</div>
      <div>Standard Express Cargo / Air Express Logistics</div>
    </div>
    <div class="awb-box">AWB: ${awb}</div>
    <div class="barcode">||| | |||| || ||| |||| |</div>
    <div class="${isCod ? 'cod-banner' : 'prepaid-banner'}">
      ${isCod ? 'CASH ON DELIVERY (COD): ₹' + codAmount : 'PREPAID — DO NOT COLLECT CASH'}
    </div>
    <div class="section">
      <strong>SHIP TO (CONSIGNEE):</strong><br>
      <strong>${order.customer?.name || 'Customer'}</strong><br>
      ${order.shipping?.address || 'Address Not Provided'}<br>
      ${order.shipping?.city || ''} - ${order.shipping?.pincode || ''}<br>
      Phone: ${order.customer?.phone || 'N/A'}
    </div>
    <div class="section">
      <strong>RETURN TO (SHIPPER):</strong><br>
      ${config.warehouse?.name || 'Fibax Ayurveda Fulfillment Hub'}<br>
      ${config.warehouse?.address || 'SCO 42, Sector 12, Chandigarh Corridor'}<br>
      ${config.warehouse?.city || 'Zirakpur'}, ${config.warehouse?.state || 'Punjab'} - ${config.warehouse?.pincode || '140603'}<br>
      Helpline: ${config.warehouse?.phone || '+91-8872544458'}
    </div>
    <table class="details-table">
      <tr><td><strong>Order ID:</strong></td><td>${orderId}</td></tr>
      <tr><td><strong>Date:</strong></td><td>${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</td></tr>
      <tr><td><strong>Items:</strong></td><td>${itemsSummary || 'Ayurvedic Formulations'}</td></tr>
      <tr><td><strong>Payment:</strong></td><td>${order.payment?.method || 'COD'}</td></tr>
    </table>
    <div class="footer">
      WHO-GMP & Ministry of AYUSH Certified Facility • Fibax Ayurveda Healthcare
    </div>
  </div>
</body>
</html>`;
}
