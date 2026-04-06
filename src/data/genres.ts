export const GENRE_CATEGORIES: Record<string, string[]> = {
  "Bass Music": [
    "Dubstep", "Riddim", "Brostep", "Deep Dubstep", "Future Bass",
    "Trap", "Wave", "Hybrid Trap", "Bass House",
  ],
  "Drum & Bass": [
    "Liquid DnB", "Neurofunk", "Jump Up", "Jungle", "Breakcore",
    "Halftime", "Rollers",
  ],
  "House": [
    "Deep House", "Tech House", "Progressive House", "Minimal House",
    "Afro House", "Acid House", "Jackin House", "Electro House",
  ],
  "Techno": [
    "Peak Time Techno", "Hard Techno", "Melodic Techno", "Minimal Techno",
    "Industrial Techno", "Acid Techno", "Dub Techno",
  ],
  "UK Sound": [
    "UK Garage", "2-Step", "Grime", "Bassline", "UK Funky",
    "Speed Garage",
  ],
  "Breakbeat": [
    "Breakbeat", "Breaks", "Big Beat", "Nu-Skool Breaks",
    "Electro Breaks",
  ],
  "Experimental": [
    "Experimental", "IDM", "Glitch", "Sound Design",
    "Ambient", "Drone", "Noise",
  ],
  "Dub & Reggae": [
    "Dub", "Digital Dub", "Dub Techno", "Reggaeton",
    "Dancehall",
  ],
  "Hard Dance": [
    "Hardstyle", "Hardcore", "Gabber", "Frenchcore",
    "Happy Hardcore", "Hard Trance",
  ],
  "Trance": [
    "Psytrance", "Progressive Trance", "Uplifting Trance",
    "Goa Trance", "Tech Trance",
  ],
};

export const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat();
