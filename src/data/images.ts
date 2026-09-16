/**
 * Centralized image configuration (Unsplash source URLs).
 * Every image used in the app resolves through this layer so the
 * asset pipeline can be swapped for local files or a CDN later.
 */

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  hero: {
    field: unsplash("1625246333195-78d9c38ad449", 1600),
    farmerPortrait: unsplash("1595246140625-573b715d11dc", 900),
  },
  farmers: {
    ramesh: unsplash("1507003211169-0a1dd7228f2d", 400),
    sahib: unsplash("1544005313-94ddf0286df2", 400),
    Anita: unsplash("1494790108377-be9c29b29330", 400),
  },
  crops: {
    wheat: unsplash("1567306226416-28f0efdc88ce", 1200),
    rice: unsplash("1586201375761-83865001e31c", 1200),
    cotton: unsplash("1523348837708-15d4a09cfac2", 1200),
    soybean: unsplash("1560493676-04071c5f467b", 1200),
    sugarcane: unsplash("1515705576963-95cad62945b6", 1200),
    tomato: unsplash("1592924357228-91a4daadcfea", 1200),
    onion: unsplash("1618512496248-a07fe83aa8cb", 1200),
    maize: unsplash("1601493700631-2b16ec4b4716", 1200),
    millet: unsplash("1586201375761-83865001e31c", 1200),
    chickpea: unsplash("1533628635777-112b2239b1c7", 1200),
  },
  centres: {
    nagpur: unsplash("1500382017468-9049fed747ef", 1200),
    pune: unsplash("1464226184884-fa280b87c399", 1200),
    nashik: unsplash("1625246333195-78d9c38ad449", 1200),
    indore: unsplash("1506976785307-8732e854ad03", 1200),
    jaipur: unsplash("1560493676-04071c5f467b", 1200),
    lucknow: unsplash("1625244724120-1fd1d34d00f6", 1200),
    bengaluru: unsplash("1495107334309-fcf20504a5ab", 1200),
    hyderabad: unsplash("1498837167922-ddd27525d352", 1200),
    chandigarh: unsplash("1464146072230-91cabc968266", 1200),
  },
  news: {
    monsoon: unsplash("1470252649378-9c29740c9fa8", 1200),
    mandi: unsplash("1595855759920-86582396756a", 1200),
    drone: unsplash("1473968512647-3e447244af8f", 1200),
    scheme: unsplash("1454165804606-c3d57bc86b40", 1200),
    wheat: unsplash("1428592953211-077101b2021b", 1200),
    tractor: unsplash("1592982537447-7440770cbfc9", 1200),
    weather: unsplash("1534088568595-a066f410bcda", 1200),
    market: unsplash("1488459716781-31db52582fe9", 1200),
  },
  experts: {
    drSharma: unsplash("1559839734-2b71ea197ec2", 500),
    drDeshmukh: unsplash("1622253692010-333f2da6031d", 500),
    profReddy: unsplash("1612349317150-e413f6a5b16d", 500),
    drKaur: unsplash("1594744803329-e58b31de8bf5", 500),
  },
  patterns: {
    weave: unsplash("1509233725247-49e657c54213", 1200),
  },
} as const;

export const cropImage = (crop: string): string => {
  const key = crop.toLowerCase() as keyof typeof images.crops;
  return images.crops[key] ?? images.crops.wheat;
};
