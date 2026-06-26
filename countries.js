/* ═══════════════════════════════════════════════════
   COUNTRY AUTOCOMPLETE — countries data + widget logic
════════════════════════════════════════════════════ */

// Full world country list with flag emoji and region grouping
const COUNTRIES = [
  // ── Popular (shown first when no query) ──────────────────────────────────
  { name: 'Australia',             flag: '🇦🇺', region: 'Oceania',        popular: true },
  { name: 'New Zealand',           flag: '🇳🇿', region: 'Oceania',        popular: true },
  { name: 'United States',         flag: '🇺🇸', region: 'Americas',       popular: true },
  { name: 'United Kingdom',        flag: '🇬🇧', region: 'Europe',         popular: true },
  { name: 'Japan',                 flag: '🇯🇵', region: 'Asia',           popular: true },
  { name: 'France',                flag: '🇫🇷', region: 'Europe',         popular: true },
  { name: 'Italy',                 flag: '🇮🇹', region: 'Europe',         popular: true },
  { name: 'Thailand',              flag: '🇹🇭', region: 'Asia',           popular: true },
  { name: 'Indonesia',             flag: '🇮🇩', region: 'Asia',           popular: true },
  { name: 'Singapore',             flag: '🇸🇬', region: 'Asia',           popular: true },
  { name: 'Spain',                 flag: '🇪🇸', region: 'Europe',         popular: true },
  { name: 'Germany',               flag: '🇩🇪', region: 'Europe',         popular: true },
  { name: 'Canada',                flag: '🇨🇦', region: 'Americas',       popular: true },
  { name: 'India',                 flag: '🇮🇳', region: 'Asia',           popular: true },
  { name: 'China',                 flag: '🇨🇳', region: 'Asia',           popular: true },
  { name: 'South Korea',           flag: '🇰🇷', region: 'Asia',           popular: true },
  { name: 'Vietnam',               flag: '🇻🇳', region: 'Asia',           popular: true },
  { name: 'Malaysia',              flag: '🇲🇾', region: 'Asia',           popular: true },
  { name: 'Philippines',           flag: '🇵🇭', region: 'Asia',           popular: true },
  { name: 'United Arab Emirates',  flag: '🇦🇪', region: 'Middle East',    popular: true },

  // ── Asia ────────────────────────────────────────────────────────────────
  { name: 'Afghanistan',           flag: '🇦🇫', region: 'Asia' },
  { name: 'Armenia',               flag: '🇦🇲', region: 'Asia' },
  { name: 'Azerbaijan',            flag: '🇦🇿', region: 'Asia' },
  { name: 'Bahrain',               flag: '🇧🇭', region: 'Middle East' },
  { name: 'Bangladesh',            flag: '🇧🇩', region: 'Asia' },
  { name: 'Bhutan',                flag: '🇧🇹', region: 'Asia' },
  { name: 'Brunei',                flag: '🇧🇳', region: 'Asia' },
  { name: 'Cambodia',              flag: '🇰🇭', region: 'Asia' },
  { name: 'Cyprus',                flag: '🇨🇾', region: 'Asia' },
  { name: 'Georgia',               flag: '🇬🇪', region: 'Asia' },
  { name: 'Hong Kong',             flag: '🇭🇰', region: 'Asia' },
  { name: 'Iran',                  flag: '🇮🇷', region: 'Middle East' },
  { name: 'Iraq',                  flag: '🇮🇶', region: 'Middle East' },
  { name: 'Israel',                flag: '🇮🇱', region: 'Middle East' },
  { name: 'Jordan',                flag: '🇯🇴', region: 'Middle East' },
  { name: 'Kazakhstan',            flag: '🇰🇿', region: 'Asia' },
  { name: 'Kuwait',                flag: '🇰🇼', region: 'Middle East' },
  { name: 'Kyrgyzstan',            flag: '🇰🇬', region: 'Asia' },
  { name: 'Laos',                  flag: '🇱🇦', region: 'Asia' },
  { name: 'Lebanon',               flag: '🇱🇧', region: 'Middle East' },
  { name: 'Macao',                 flag: '🇲🇴', region: 'Asia' },
  { name: 'Maldives',              flag: '🇲🇻', region: 'Asia' },
  { name: 'Mongolia',              flag: '🇲🇳', region: 'Asia' },
  { name: 'Myanmar',               flag: '🇲🇲', region: 'Asia' },
  { name: 'Nepal',                 flag: '🇳🇵', region: 'Asia' },
  { name: 'North Korea',           flag: '🇰🇵', region: 'Asia' },
  { name: 'Oman',                  flag: '🇴🇲', region: 'Middle East' },
  { name: 'Pakistan',              flag: '🇵🇰', region: 'Asia' },
  { name: 'Palestine',             flag: '🇵🇸', region: 'Middle East' },
  { name: 'Qatar',                 flag: '🇶🇦', region: 'Middle East' },
  { name: 'Russia',                flag: '🇷🇺', region: 'Europe / Asia' },
  { name: 'Saudi Arabia',          flag: '🇸🇦', region: 'Middle East' },
  { name: 'Sri Lanka',             flag: '🇱🇰', region: 'Asia' },
  { name: 'Syria',                 flag: '🇸🇾', region: 'Middle East' },
  { name: 'Taiwan',                flag: '🇹🇼', region: 'Asia' },
  { name: 'Tajikistan',            flag: '🇹🇯', region: 'Asia' },
  { name: 'Timor-Leste',           flag: '🇹🇱', region: 'Asia' },
  { name: 'Turkey',                flag: '🇹🇷', region: 'Europe / Asia' },
  { name: 'Turkmenistan',          flag: '🇹🇲', region: 'Asia' },
  { name: 'Uzbekistan',            flag: '🇺🇿', region: 'Asia' },
  { name: 'Yemen',                 flag: '🇾🇪', region: 'Middle East' },

  // ── Europe ───────────────────────────────────────────────────────────────
  { name: 'Albania',               flag: '🇦🇱', region: 'Europe' },
  { name: 'Andorra',               flag: '🇦🇩', region: 'Europe' },
  { name: 'Austria',               flag: '🇦🇹', region: 'Europe' },
  { name: 'Belarus',               flag: '🇧🇾', region: 'Europe' },
  { name: 'Belgium',               flag: '🇧🇪', region: 'Europe' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', region: 'Europe' },
  { name: 'Bulgaria',              flag: '🇧🇬', region: 'Europe' },
  { name: 'Croatia',               flag: '🇭🇷', region: 'Europe' },
  { name: 'Czech Republic',        flag: '🇨🇿', region: 'Europe' },
  { name: 'Denmark',               flag: '🇩🇰', region: 'Europe' },
  { name: 'Estonia',               flag: '🇪🇪', region: 'Europe' },
  { name: 'Finland',               flag: '🇫🇮', region: 'Europe' },
  { name: 'Greece',                flag: '🇬🇷', region: 'Europe' },
  { name: 'Hungary',               flag: '🇭🇺', region: 'Europe' },
  { name: 'Iceland',               flag: '🇮🇸', region: 'Europe' },
  { name: 'Ireland',               flag: '🇮🇪', region: 'Europe' },
  { name: 'Kosovo',                flag: '🇽🇰', region: 'Europe' },
  { name: 'Latvia',                flag: '🇱🇻', region: 'Europe' },
  { name: 'Liechtenstein',         flag: '🇱🇮', region: 'Europe' },
  { name: 'Lithuania',             flag: '🇱🇹', region: 'Europe' },
  { name: 'Luxembourg',            flag: '🇱🇺', region: 'Europe' },
  { name: 'Malta',                 flag: '🇲🇹', region: 'Europe' },
  { name: 'Moldova',               flag: '🇲🇩', region: 'Europe' },
  { name: 'Monaco',                flag: '🇲🇨', region: 'Europe' },
  { name: 'Montenegro',            flag: '🇲🇪', region: 'Europe' },
  { name: 'Netherlands',           flag: '🇳🇱', region: 'Europe' },
  { name: 'North Macedonia',       flag: '🇲🇰', region: 'Europe' },
  { name: 'Norway',                flag: '🇳🇴', region: 'Europe' },
  { name: 'Poland',                flag: '🇵🇱', region: 'Europe' },
  { name: 'Portugal',              flag: '🇵🇹', region: 'Europe' },
  { name: 'Romania',               flag: '🇷🇴', region: 'Europe' },
  { name: 'San Marino',            flag: '🇸🇲', region: 'Europe' },
  { name: 'Serbia',                flag: '🇷🇸', region: 'Europe' },
  { name: 'Slovakia',              flag: '🇸🇰', region: 'Europe' },
  { name: 'Slovenia',              flag: '🇸🇮', region: 'Europe' },
  { name: 'Sweden',                flag: '🇸🇪', region: 'Europe' },
  { name: 'Switzerland',           flag: '🇨🇭', region: 'Europe' },
  { name: 'Ukraine',               flag: '🇺🇦', region: 'Europe' },
  { name: 'Vatican City',          flag: '🇻🇦', region: 'Europe' },

  // ── Americas ─────────────────────────────────────────────────────────────
  { name: 'Argentina',             flag: '🇦🇷', region: 'Americas' },
  { name: 'Bahamas',               flag: '🇧🇸', region: 'Americas' },
  { name: 'Barbados',              flag: '🇧🇧', region: 'Americas' },
  { name: 'Belize',                flag: '🇧🇿', region: 'Americas' },
  { name: 'Bolivia',               flag: '🇧🇴', region: 'Americas' },
  { name: 'Brazil',                flag: '🇧🇷', region: 'Americas' },
  { name: 'Chile',                 flag: '🇨🇱', region: 'Americas' },
  { name: 'Colombia',              flag: '🇨🇴', region: 'Americas' },
  { name: 'Costa Rica',            flag: '🇨🇷', region: 'Americas' },
  { name: 'Cuba',                  flag: '🇨🇺', region: 'Americas' },
  { name: 'Dominican Republic',    flag: '🇩🇴', region: 'Americas' },
  { name: 'Ecuador',               flag: '🇪🇨', region: 'Americas' },
  { name: 'El Salvador',           flag: '🇸🇻', region: 'Americas' },
  { name: 'Guatemala',             flag: '🇬🇹', region: 'Americas' },
  { name: 'Haiti',                 flag: '🇭🇹', region: 'Americas' },
  { name: 'Honduras',              flag: '🇭🇳', region: 'Americas' },
  { name: 'Jamaica',               flag: '🇯🇲', region: 'Americas' },
  { name: 'Mexico',                flag: '🇲🇽', region: 'Americas' },
  { name: 'Nicaragua',             flag: '🇳🇮', region: 'Americas' },
  { name: 'Panama',                flag: '🇵🇦', region: 'Americas' },
  { name: 'Paraguay',              flag: '🇵🇾', region: 'Americas' },
  { name: 'Peru',                  flag: '🇵🇪', region: 'Americas' },
  { name: 'Puerto Rico',           flag: '🇵🇷', region: 'Americas' },
  { name: 'Trinidad and Tobago',   flag: '🇹🇹', region: 'Americas' },
  { name: 'Uruguay',               flag: '🇺🇾', region: 'Americas' },
  { name: 'Venezuela',             flag: '🇻🇪', region: 'Americas' },

  // ── Africa ───────────────────────────────────────────────────────────────
  { name: 'Algeria',               flag: '🇩🇿', region: 'Africa' },
  { name: 'Angola',                flag: '🇦🇴', region: 'Africa' },
  { name: 'Benin',                 flag: '🇧🇯', region: 'Africa' },
  { name: 'Botswana',              flag: '🇧🇼', region: 'Africa' },
  { name: 'Burkina Faso',          flag: '🇧🇫', region: 'Africa' },
  { name: 'Burundi',               flag: '🇧🇮', region: 'Africa' },
  { name: 'Cameroon',              flag: '🇨🇲', region: 'Africa' },
  { name: 'Cape Verde',            flag: '🇨🇻', region: 'Africa' },
  { name: 'Chad',                  flag: '🇹🇩', region: 'Africa' },
  { name: 'Comoros',               flag: '🇰🇲', region: 'Africa' },
  { name: 'Congo',                 flag: '🇨🇬', region: 'Africa' },
  { name: 'DR Congo',              flag: '🇨🇩', region: 'Africa' },
  { name: "Côte d'Ivoire",         flag: '🇨🇮', region: 'Africa' },
  { name: 'Djibouti',              flag: '🇩🇯', region: 'Africa' },
  { name: 'Egypt',                 flag: '🇪🇬', region: 'Africa' },
  { name: 'Equatorial Guinea',     flag: '🇬🇶', region: 'Africa' },
  { name: 'Eritrea',               flag: '🇪🇷', region: 'Africa' },
  { name: 'Eswatini',              flag: '🇸🇿', region: 'Africa' },
  { name: 'Ethiopia',              flag: '🇪🇹', region: 'Africa' },
  { name: 'Gabon',                 flag: '🇬🇦', region: 'Africa' },
  { name: 'Gambia',                flag: '🇬🇲', region: 'Africa' },
  { name: 'Ghana',                 flag: '🇬🇭', region: 'Africa' },
  { name: 'Guinea',                flag: '🇬🇳', region: 'Africa' },
  { name: 'Kenya',                 flag: '🇰🇪', region: 'Africa' },
  { name: 'Lesotho',               flag: '🇱🇸', region: 'Africa' },
  { name: 'Liberia',               flag: '🇱🇷', region: 'Africa' },
  { name: 'Libya',                 flag: '🇱🇾', region: 'Africa' },
  { name: 'Madagascar',            flag: '🇲🇬', region: 'Africa' },
  { name: 'Malawi',                flag: '🇲🇼', region: 'Africa' },
  { name: 'Mali',                  flag: '🇲🇱', region: 'Africa' },
  { name: 'Mauritania',            flag: '🇲🇷', region: 'Africa' },
  { name: 'Mauritius',             flag: '🇲🇺', region: 'Africa' },
  { name: 'Morocco',               flag: '🇲🇦', region: 'Africa' },
  { name: 'Mozambique',            flag: '🇲🇿', region: 'Africa' },
  { name: 'Namibia',               flag: '🇳🇦', region: 'Africa' },
  { name: 'Niger',                 flag: '🇳🇪', region: 'Africa' },
  { name: 'Nigeria',               flag: '🇳🇬', region: 'Africa' },
  { name: 'Rwanda',                flag: '🇷🇼', region: 'Africa' },
  { name: 'Senegal',               flag: '🇸🇳', region: 'Africa' },
  { name: 'Seychelles',            flag: '🇸🇨', region: 'Africa' },
  { name: 'Sierra Leone',          flag: '🇸🇱', region: 'Africa' },
  { name: 'Somalia',               flag: '🇸🇴', region: 'Africa' },
  { name: 'South Africa',          flag: '🇿🇦', region: 'Africa',  popular: true },
  { name: 'South Sudan',           flag: '🇸🇸', region: 'Africa' },
  { name: 'Sudan',                 flag: '🇸🇩', region: 'Africa' },
  { name: 'Tanzania',              flag: '🇹🇿', region: 'Africa' },
  { name: 'Togo',                  flag: '🇹🇬', region: 'Africa' },
  { name: 'Tunisia',               flag: '🇹🇳', region: 'Africa' },
  { name: 'Uganda',                flag: '🇺🇬', region: 'Africa' },
  { name: 'Zambia',                flag: '🇿🇲', region: 'Africa' },
  { name: 'Zimbabwe',              flag: '🇿🇼', region: 'Africa' },

  // ── Oceania ──────────────────────────────────────────────────────────────
  { name: 'Fiji',                  flag: '🇫🇯', region: 'Oceania' },
  { name: 'Kiribati',              flag: '🇰🇮', region: 'Oceania' },
  { name: 'Marshall Islands',      flag: '🇲🇭', region: 'Oceania' },
  { name: 'Micronesia',            flag: '🇫🇲', region: 'Oceania' },
  { name: 'Nauru',                 flag: '🇳🇷', region: 'Oceania' },
  { name: 'Palau',                 flag: '🇵🇼', region: 'Oceania' },
  { name: 'Papua New Guinea',      flag: '🇵🇬', region: 'Oceania' },
  { name: 'Samoa',                 flag: '🇼🇸', region: 'Oceania' },
  { name: 'Solomon Islands',       flag: '🇸🇧', region: 'Oceania' },
  { name: 'Tonga',                 flag: '🇹🇴', region: 'Oceania' },
  { name: 'Tuvalu',                flag: '🇹🇻', region: 'Oceania' },
  { name: 'Vanuatu',               flag: '🇻🇺', region: 'Oceania' },
];

// ── Major cities ──────────────────────────────────────────────────────────────
// Each city references its country's flag for visual consistency.
// `popular` cities are shown in the default (no-query) list alongside popular countries.
const CITIES = [
  // Oceania
  { name: 'Auckland',        country: 'New Zealand',          flag: '🇳🇿', popular: true },
  { name: 'Wellington',      country: 'New Zealand',          flag: '🇳🇿' },
  { name: 'Christchurch',    country: 'New Zealand',          flag: '🇳🇿' },
  { name: 'Queenstown',      country: 'New Zealand',          flag: '🇳🇿' },
  { name: 'Sydney',          country: 'Australia',            flag: '🇦🇺', popular: true },
  { name: 'Melbourne',       country: 'Australia',            flag: '🇦🇺', popular: true },
  { name: 'Brisbane',        country: 'Australia',            flag: '🇦🇺' },
  { name: 'Perth',           country: 'Australia',            flag: '🇦🇺' },
  { name: 'Gold Coast',      country: 'Australia',            flag: '🇦🇺' },
  { name: 'Cairns',          country: 'Australia',            flag: '🇦🇺' },
  { name: 'Adelaide',        country: 'Australia',            flag: '🇦🇺' },
  { name: 'Fiji (Nadi)',     country: 'Fiji',                  flag: '🇫🇯' },

  // Asia
  { name: 'Tokyo',           country: 'Japan',                flag: '🇯🇵', popular: true },
  { name: 'Osaka',           country: 'Japan',                flag: '🇯🇵', popular: true },
  { name: 'Kyoto',           country: 'Japan',                flag: '🇯🇵' },
  { name: 'Sapporo',         country: 'Japan',                flag: '🇯🇵' },
  { name: 'Fukuoka',         country: 'Japan',                flag: '🇯🇵' },
  { name: 'Seoul',           country: 'South Korea',          flag: '🇰🇷', popular: true },
  { name: 'Busan',           country: 'South Korea',          flag: '🇰🇷' },
  { name: 'Beijing',         country: 'China',                flag: '🇨🇳', popular: true },
  { name: 'Shanghai',        country: 'China',                flag: '🇨🇳', popular: true },
  { name: 'Hong Kong',       country: 'Hong Kong',            flag: '🇭🇰', popular: true },
  { name: 'Guangzhou',       country: 'China',                flag: '🇨🇳' },
  { name: 'Shenzhen',        country: 'China',                flag: '🇨🇳' },
  { name: 'Taipei',          country: 'Taiwan',                flag: '🇹🇼', popular: true },
  { name: 'Bangkok',         country: 'Thailand',             flag: '🇹🇭', popular: true },
  { name: 'Phuket',          country: 'Thailand',             flag: '🇹🇭', popular: true },
  { name: 'Chiang Mai',      country: 'Thailand',             flag: '🇹🇭' },
  { name: 'Pattaya',         country: 'Thailand',             flag: '🇹🇭' },
  { name: 'Krabi',           country: 'Thailand',             flag: '🇹🇭' },
  { name: 'Singapore City',  country: 'Singapore',            flag: '🇸🇬', popular: true },
  { name: 'Kuala Lumpur',    country: 'Malaysia',             flag: '🇲🇾', popular: true },
  { name: 'Penang',          country: 'Malaysia',             flag: '🇲🇾' },
  { name: 'Langkawi',        country: 'Malaysia',             flag: '🇲🇾' },
  { name: 'Jakarta',         country: 'Indonesia',            flag: '🇮🇩', popular: true },
  { name: 'Bali (Denpasar)', country: 'Indonesia',            flag: '🇮🇩', popular: true },
  { name: 'Yogyakarta',      country: 'Indonesia',            flag: '🇮🇩' },
  { name: 'Manila',          country: 'Philippines',          flag: '🇵🇭', popular: true },
  { name: 'Cebu',            country: 'Philippines',          flag: '🇵🇭' },
  { name: 'Boracay',         country: 'Philippines',          flag: '🇵🇭' },
  { name: 'Hanoi',           country: 'Vietnam',               flag: '🇻🇳', popular: true },
  { name: 'Ho Chi Minh City', country: 'Vietnam',              flag: '🇻🇳', popular: true },
  { name: 'Da Nang',         country: 'Vietnam',                flag: '🇻🇳' },
  { name: 'Phnom Penh',      country: 'Cambodia',              flag: '🇰🇭' },
  { name: 'Siem Reap',       country: 'Cambodia',              flag: '🇰🇭' },
  { name: 'Vientiane',       country: 'Laos',                  flag: '🇱🇦' },
  { name: 'Yangon',          country: 'Myanmar',                flag: '🇲🇲' },
  { name: 'Mumbai',          country: 'India',                flag: '🇮🇳', popular: true },
  { name: 'Delhi',           country: 'India',                flag: '🇮🇳', popular: true },
  { name: 'Bengaluru',       country: 'India',                flag: '🇮🇳' },
  { name: 'Goa',             country: 'India',                flag: '🇮🇳' },
  { name: 'Jaipur',          country: 'India',                flag: '🇮🇳' },
  { name: 'Chennai',         country: 'India',                flag: '🇮🇳' },
  { name: 'Kathmandu',       country: 'Nepal',                 flag: '🇳🇵' },
  { name: 'Colombo',         country: 'Sri Lanka',             flag: '🇱🇰' },
  { name: 'Malé',            country: 'Maldives',              flag: '🇲🇻' },
  { name: 'Dubai',           country: 'United Arab Emirates',  flag: '🇦🇪', popular: true },
  { name: 'Abu Dhabi',       country: 'United Arab Emirates',  flag: '🇦🇪' },
  { name: 'Doha',            country: 'Qatar',                  flag: '🇶🇦' },
  { name: 'Tel Aviv',        country: 'Israel',                 flag: '🇮🇱' },
  { name: 'Istanbul',        country: 'Turkey',                 flag: '🇹🇷', popular: true },
  { name: 'Cappadocia',      country: 'Turkey',                 flag: '🇹🇷' },

  // Europe
  { name: 'London',          country: 'United Kingdom',        flag: '🇬🇧', popular: true },
  { name: 'Manchester',      country: 'United Kingdom',        flag: '🇬🇧' },
  { name: 'Edinburgh',       country: 'United Kingdom',        flag: '🇬🇧' },
  { name: 'Paris',           country: 'France',                 flag: '🇫🇷', popular: true },
  { name: 'Nice',            country: 'France',                 flag: '🇫🇷' },
  { name: 'Lyon',            country: 'France',                  flag: '🇫🇷' },
  { name: 'Rome',            country: 'Italy',                   flag: '🇮🇹', popular: true },
  { name: 'Milan',           country: 'Italy',                   flag: '🇮🇹' },
  { name: 'Venice',          country: 'Italy',                   flag: '🇮🇹', popular: true },
  { name: 'Florence',        country: 'Italy',                   flag: '🇮🇹' },
  { name: 'Naples',          country: 'Italy',                    flag: '🇮🇹' },
  { name: 'Barcelona',       country: 'Spain',                    flag: '🇪🇸', popular: true },
  { name: 'Madrid',          country: 'Spain',                    flag: '🇪🇸', popular: true },
  { name: 'Seville',         country: 'Spain',                    flag: '🇪🇸' },
  { name: 'Ibiza',           country: 'Spain',                    flag: '🇪🇸' },
  { name: 'Berlin',          country: 'Germany',                  flag: '🇩🇪', popular: true },
  { name: 'Munich',          country: 'Germany',                  flag: '🇩🇪' },
  { name: 'Frankfurt',       country: 'Germany',                  flag: '🇩🇪' },
  { name: 'Hamburg',         country: 'Germany',                  flag: '🇩🇪' },
  { name: 'Amsterdam',       country: 'Netherlands',              flag: '🇳🇱', popular: true },
  { name: 'Rotterdam',       country: 'Netherlands',              flag: '🇳🇱' },
  { name: 'Lisbon',          country: 'Portugal',                 flag: '🇵🇹', popular: true },
  { name: 'Porto',           country: 'Portugal',                 flag: '🇵🇹' },
  { name: 'Vienna',          country: 'Austria',                  flag: '🇦🇹' },
  { name: 'Zurich',          country: 'Switzerland',              flag: '🇨🇭' },
  { name: 'Geneva',          country: 'Switzerland',              flag: '🇨🇭' },
  { name: 'Interlaken',      country: 'Switzerland',              flag: '🇨🇭' },
  { name: 'Brussels',        country: 'Belgium',                  flag: '🇧🇪' },
  { name: 'Dublin',          country: 'Ireland',                  flag: '🇮🇪' },
  { name: 'Copenhagen',      country: 'Denmark',                  flag: '🇩🇰' },
  { name: 'Stockholm',       country: 'Sweden',                   flag: '🇸🇪' },
  { name: 'Oslo',            country: 'Norway',                   flag: '🇳🇴' },
  { name: 'Helsinki',        country: 'Finland',                  flag: '🇫🇮' },
  { name: 'Reykjavik',       country: 'Iceland',                   flag: '🇮🇸' },
  { name: 'Athens',          country: 'Greece',                    flag: '🇬🇷', popular: true },
  { name: 'Santorini',       country: 'Greece',                    flag: '🇬🇷', popular: true },
  { name: 'Mykonos',         country: 'Greece',                    flag: '🇬🇷' },
  { name: 'Prague',          country: 'Czech Republic',            flag: '🇨🇿', popular: true },
  { name: 'Budapest',        country: 'Hungary',                   flag: '🇭🇺', popular: true },
  { name: 'Warsaw',          country: 'Poland',                    flag: '🇵🇱' },
  { name: 'Krakow',          country: 'Poland',                    flag: '🇵🇱' },
  { name: 'Moscow',          country: 'Russia',                     flag: '🇷🇺' },
  { name: 'Saint Petersburg', country: 'Russia',                    flag: '🇷🇺' },

  // Americas
  { name: 'New York',        country: 'United States',             flag: '🇺🇸', popular: true },
  { name: 'Los Angeles',     country: 'United States',             flag: '🇺🇸', popular: true },
  { name: 'San Francisco',   country: 'United States',             flag: '🇺🇸', popular: true },
  { name: 'Las Vegas',       country: 'United States',             flag: '🇺🇸', popular: true },
  { name: 'Chicago',         country: 'United States',              flag: '🇺🇸' },
  { name: 'Miami',           country: 'United States',              flag: '🇺🇸', popular: true },
  { name: 'Seattle',         country: 'United States',              flag: '🇺🇸' },
  { name: 'Boston',          country: 'United States',              flag: '🇺🇸' },
  { name: 'Honolulu',        country: 'United States',               flag: '🇺🇸' },
  { name: 'Orlando',         country: 'United States',               flag: '🇺🇸' },
  { name: 'Toronto',         country: 'Canada',                      flag: '🇨🇦', popular: true },
  { name: 'Vancouver',       country: 'Canada',                      flag: '🇨🇦', popular: true },
  { name: 'Montreal',        country: 'Canada',                       flag: '🇨🇦' },
  { name: 'Mexico City',     country: 'Mexico',                       flag: '🇲🇽', popular: true },
  { name: 'Cancún',          country: 'Mexico',                        flag: '🇲🇽', popular: true },
  { name: 'Playa del Carmen', country: 'Mexico',                       flag: '🇲🇽' },
  { name: 'Rio de Janeiro',  country: 'Brazil',                        flag: '🇧🇷', popular: true },
  { name: 'São Paulo',       country: 'Brazil',                        flag: '🇧🇷' },
  { name: 'Buenos Aires',    country: 'Argentina',                     flag: '🇦🇷', popular: true },
  { name: 'Santiago',        country: 'Chile',                          flag: '🇨🇱' },
  { name: 'Lima',            country: 'Peru',                           flag: '🇵🇪' },
  { name: 'Cusco',           country: 'Peru',                           flag: '🇵🇪' },
  { name: 'Bogotá',          country: 'Colombia',                       flag: '🇨🇴' },
  { name: 'Cartagena',       country: 'Colombia',                       flag: '🇨🇴' },
  { name: 'Havana',          country: 'Cuba',                            flag: '🇨🇺' },
  { name: 'Nassau',          country: 'Bahamas',                         flag: '🇧🇸' },
  { name: 'Punta Cana',      country: 'Dominican Republic',              flag: '🇩🇴' },

  // Africa
  { name: 'Cairo',           country: 'Egypt',                          flag: '🇪🇬', popular: true },
  { name: 'Marrakech',       country: 'Morocco',                         flag: '🇲🇦', popular: true },
  { name: 'Casablanca',      country: 'Morocco',                         flag: '🇲🇦' },
  { name: 'Cape Town',       country: 'South Africa',                    flag: '🇿🇦', popular: true },
  { name: 'Johannesburg',    country: 'South Africa',                    flag: '🇿🇦' },
  { name: 'Nairobi',         country: 'Kenya',                            flag: '🇰🇪' },
  { name: 'Zanzibar',        country: 'Tanzania',                         flag: '🇹🇿' },
  { name: 'Lagos',           country: 'Nigeria',                          flag: '🇳🇬' },
];

// ── Combobox state ────────────────────────────────────────────────────────────
const comboState = {
  origin:          { selectedName: '', highlightIdx: -1 },
  destination:     { selectedName: '', highlightIdx: -1 },
  tripDestination: { selectedName: '', highlightIdx: -1 },
};

const COMBO_IDS = {
  origin:          { input: 'plannerOrigin',        list: 'listOrigin',        flag: 'flagOrigin',        clear: 'clearOrigin'        },
  destination:     { input: 'plannerDestination',   list: 'listDestination',   flag: 'flagDestination',   clear: 'clearDestination'   },
  tripDestination: { input: 'tripDestinationInput', list: 'listTripDest',      flag: 'flagTripDest',      clear: 'clearTripDest'      },
};

// ── Render helpers ────────────────────────────────────────────────────────────

function highlight(text, query) {
  if (!query) return escHtml(text);
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escHtml(text).replace(re, '<mark>$1</mark>');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildItems(query) {
  if (!query) {
    // Default view: popular cities first, then popular countries
    const popularCities    = CITIES.filter(c => c.popular);
    const popularCountries = COUNTRIES.filter(c => c.popular);
    return [
      { type: 'label', text: '🏙 Popular cities' },
      ...popularCities.map(c => ({ type: 'item', kind: 'city', data: c })),
      { type: 'label', text: '✈ Popular countries' },
      ...popularCountries.map(c => ({ type: 'item', kind: 'country', data: c })),
    ];
  }

  const q = query.toLowerCase().trim();
  const rank = (name) => {
    const n = name.toLowerCase();
    if (n.startsWith(q)) return 0;
    if (n.includes(' ' + q)) return 1; // matches start of a word, e.g. "new" in "New York"
    return 2;
  };

  const cityMatches = CITIES
    .filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

  const countryMatches = COUNTRIES
    .filter(c => c.name.toLowerCase().includes(q))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

  const items = [];
  if (cityMatches.length) {
    items.push({ type: 'label', text: `🏙 Cities (${cityMatches.length})` });
    items.push(...cityMatches.map(c => ({ type: 'item', kind: 'city', data: c })));
  }
  if (countryMatches.length) {
    items.push({ type: 'label', text: `✈ Countries (${countryMatches.length})` });
    items.push(...countryMatches.map(c => ({ type: 'item', kind: 'country', data: c })));
  }
  return items;
}

function renderList(comboKey, items) {
  const ids = COMBO_IDS[comboKey];
  const list = document.getElementById(ids.list);
  const state = comboState[comboKey];
  const query = document.getElementById(ids.input).value.trim();

  if (items.filter(i => i.type === 'item').length === 0) {
    list.innerHTML = `<li class="country-no-results">No cities or countries match "${escHtml(query)}"</li>`;
    return;
  }

  list.innerHTML = items.map((item) => {
    if (item.type === 'label') {
      return `<li class="country-group-label">${item.text}</li>`;
    }

    const isCity = item.kind === 'city';
    const d = item.data;
    const displayName = isCity ? d.name : d.name;
    // Value stored/selected is "City, Country" for cities, just the name for countries —
    // keeps the planner's downstream string useful while the UI stays compact.
    const selectValue = isCity ? `${d.name}, ${d.country}` : d.name;
    const isSelected = selectValue === state.selectedName;
    const subLabel = isCity ? d.country : (d.region || '');

    return `
      <li class="country-option${isSelected ? ' selected' : ''}"
          role="option"
          aria-selected="${isSelected}"
          data-value="${escHtml(selectValue)}"
          data-flag="${d.flag}"
          onmousedown="selectCountry('${comboKey}','${escHtml(selectValue).replace(/'/g, "\\'")}','${d.flag}')"
          onmouseover="hoverOption('${comboKey}', this)">
        <span class="country-option-flag">${d.flag}</span>
        <span class="country-option-name">
          ${highlight(displayName, query)}${isCity ? `<span class="country-option-citytag">CITY</span>` : ''}
        </span>
        <span class="country-option-region">${subLabel}</span>
      </li>`;
  }).join('');
}

// ── Public API — called from HTML ─────────────────────────────────────────────

function openCombo(comboKey) {
  const ids = COMBO_IDS[comboKey];
  const list = document.getElementById(ids.list);
  const input = document.getElementById(ids.input);
  const items = buildItems(input.value.trim());
  renderList(comboKey, items);
  list.classList.add('open');
  input.setAttribute('aria-expanded', 'true');
  comboState[comboKey].highlightIdx = -1;
}

function filterCountries(comboKey) {
  const ids = COMBO_IDS[comboKey];
  const input = document.getElementById(ids.input);
  const clear = document.getElementById(ids.clear);
  const flag = document.getElementById(ids.flag);

  // Reset selection if user is typing again
  comboState[comboKey].selectedName = '';
  flag.textContent = '';
  clear.classList.toggle('hidden', !input.value);

  openCombo(comboKey);
}

function selectCountry(comboKey, name, flagEmoji, silent = false) {
  const ids = COMBO_IDS[comboKey];
  const input = document.getElementById(ids.input);
  const list  = document.getElementById(ids.list);
  const flag  = document.getElementById(ids.flag);
  const clear = document.getElementById(ids.clear);

  input.value = name;
  flag.textContent = flagEmoji;
  comboState[comboKey].selectedName = name;
  clear.classList.remove('hidden');

  list.classList.remove('open');
  input.setAttribute('aria-expanded', 'false');
  if (!silent) input.focus();
}

function clearCombo(comboKey, silent = false) {
  const ids = COMBO_IDS[comboKey];
  document.getElementById(ids.input).value = '';
  document.getElementById(ids.flag).textContent = '';
  document.getElementById(ids.clear).classList.add('hidden');
  comboState[comboKey].selectedName = '';
  if (!silent) document.getElementById(ids.input).focus();
}

function hoverOption(comboKey, el) {
  const ids = COMBO_IDS[comboKey];
  const list = document.getElementById(ids.list);
  list.querySelectorAll('.country-option.highlighted')
    .forEach(o => o.classList.remove('highlighted'));
  el.classList.add('highlighted');
  const allOptions = [...list.querySelectorAll('.country-option')];
  comboState[comboKey].highlightIdx = allOptions.indexOf(el);
}

function comboKeydown(event, comboKey) {
  const ids = COMBO_IDS[comboKey];
  const list = document.getElementById(ids.list);
  if (!list.classList.contains('open')) {
    if (event.key === 'ArrowDown' || event.key === 'Enter') openCombo(comboKey);
    return;
  }

  const options = [...list.querySelectorAll('.country-option')];
  const state = comboState[comboKey];

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    state.highlightIdx = Math.min(state.highlightIdx + 1, options.length - 1);
    updateHighlight(options, state.highlightIdx);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    state.highlightIdx = Math.max(state.highlightIdx - 1, 0);
    updateHighlight(options, state.highlightIdx);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (state.highlightIdx >= 0 && options[state.highlightIdx]) {
      const opt = options[state.highlightIdx];
      selectCountry(comboKey, opt.dataset.value, opt.dataset.flag);
    }
  } else if (event.key === 'Escape' || event.key === 'Tab') {
    list.classList.remove('open');
    document.getElementById(ids.input).setAttribute('aria-expanded', 'false');
  }
}

function updateHighlight(options, idx) {
  options.forEach((o, i) => o.classList.toggle('highlighted', i === idx));
  if (options[idx]) options[idx].scrollIntoView({ block: 'nearest' });
}

// Close any open dropdown when clicking outside
document.addEventListener('mousedown', (e) => {
  ['origin', 'destination', 'tripDestination'].forEach(key => {
    const ids = COMBO_IDS[key];
    const combo = document.getElementById(ids.input)?.closest('.country-combo');
    if (combo && !combo.contains(e.target)) {
      const list = document.getElementById(ids.list);
      list?.classList.remove('open');
      document.getElementById(ids.input)?.setAttribute('aria-expanded', 'false');
    }
  });
});