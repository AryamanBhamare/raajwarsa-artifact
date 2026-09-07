export const BRAND = {
  name: 'Raajwarasa',
  instagramHandle: 'raajwarasa_artifacts',
  instagramUrl: 'https://instagram.com/raajwarasa_artifacts',
  whatsappNumber: '917030751155',
  whatsappMessage: 'Namaskar, I would like to know more about Raajwarasa.',
  phoneDisplay: '+91 70307 51155',
  phoneUrl: 'tel:+917030751155',
  emailDisplay: '',
  address: 'Deo Wada, Keshav Nagar, Chinchwad, Pimpri-Chinchwad, Maharashtra 411033',
  mapQuery: 'Raajwarasa Artifacts, Deo Wada, Keshav Nagar, Chinchwad, Pimpri-Chinchwad, Maharashtra 411033',
  mapPlusCode: 'JQ9H+VP Pimpri-Chinchwad, Maharashtra 411033',
  mapLat: 18.6247078,
  mapLng: 73.7792679
};

export const whatsappUrl = (message) =>
  `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message || BRAND.whatsappMessage)}`;

export const mapEmbedUrl = `https://maps.google.com/maps?q=${BRAND.mapLat},${BRAND.mapLng}&z=16&output=embed`;

export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`;

export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BRAND.mapLat},${BRAND.mapLng}`;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);