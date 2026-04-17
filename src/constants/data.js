// Cities organized by province
export const CITIES_BY_PROVINCE = {
  'Punjab': [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sheikhupura',
    'Jhang',
  ],
  'Sindh': [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Mirpurkhas',
    'Nawabshah',
    'Jacobabad',
    'Shikarpur',
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar',
    'Mardan',
    'Abbottabad',
    'Mingora',
    'Kohat',
    'Bannu',
    'Swabi',
    'Dera Ismail Khan',
  ],
  'Balochistan': [
    'Quetta',
    'Gwadar',
    'Turbat',
    'Khuzdar',
    'Sibi',
    'Chaman',
    'Zhob',
  ],
  'Gilgit-Baltistan': [
    'Gilgit',
    'Skardu',
    'Hunza',
    'Ghizer',
    'Diamer',
  ],
  'Azad Jammu & Kashmir': [
    'Muzaffarabad',
    'Mirpur',
    'Rawalakot',
    'Kotli',
    'Bhimber',
  ],
};

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
];

// Fallback all cities list
export const ALL_CITIES = Object.values(CITIES_BY_PROVINCE).flat().sort();