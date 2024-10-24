// Word lists
const adjectives = [
    'ancient', 'autumn', 'bold', 'brave', 'bright', 'calm', 'clever', 'coastal',
    'cosmic', 'crimson', 'dancing', 'daring', 'desert', 'divine', 'double',
    'dreamy', 'eager', 'electric', 'elegant', 'ember', 'fancy', 'fierce',
    'flying', 'forest', 'frozen', 'gentle', 'golden', 'happy', 'hidden',
    'hollow', 'humble', 'icy', 'infinite', 'inner', 'jade', 'jolly', 'joyful',
    'kind', 'lazy', 'little', 'lonely', 'lunar', 'magic', 'merry', 'mighty',
    'misty', 'morning', 'mystic', 'noble', 'ocean', 'peaceful', 'proud',
    'purple', 'quiet', 'rapid', 'royal', 'ruby', 'rustic', 'sacred', 'sandy',
    'secret', 'shadow', 'silent', 'silver', 'simple', 'singing', 'sleepy',
    'snowy', 'solar', 'spring', 'storm', 'summer', 'sunny', 'swift', 'thunder',
    'tiger', 'tiny', 'triple', 'twilight', 'urban', 'vintage', 'wild', 'winter',
    'wise', 'wondering'
  ];

  const nouns = [
    'angel', 'autumn', 'badger', 'bamboo', 'beach', 'bear', 'bird', 'blossom',
    'breeze', 'brook', 'butterfly', 'canopy', 'canyon', 'castle', 'cave',
    'cloud', 'coral', 'crystal', 'dawn', 'deer', 'desert', 'dolphin', 'dragon',
    'dream', 'eagle', 'echo', 'ember', 'falcon', 'feather', 'fire', 'fish',
    'flame', 'flower', 'forest', 'fox', 'garden', 'gate', 'gazelle', 'ghost',
    'glacier', 'glade', 'grove', 'harbor', 'hawk', 'heart', 'hero', 'hill',
    'horizon', 'island', 'jungle', 'lagoon', 'lake', 'leaf', 'lion', 'lotus',
    'mammoth', 'meadow', 'meteor', 'mirror', 'moon', 'mountain', 'night',
    'ocean', 'orchid', 'owl', 'palm', 'path', 'penguin', 'phoenix', 'pirate',
    'pond', 'rabbit', 'rain', 'rainbow', 'rapids', 'river', 'rose', 'sage',
    'sailor', 'sea', 'shadow', 'shark', 'sky', 'snow', 'sparrow', 'spring',
    'star', 'stone', 'storm', 'stream', 'sun', 'sunrise', 'sunset', 'swift',
    'tiger', 'tree', 'valley', 'wave', 'whale', 'wind', 'wolf', 'wood'
  ];

  type GeneratorOptions = {
    /** Separator between words. Defaults to '-' */
    separator?: string;
    /** Number of words to generate. Defaults to 2 */
    wordCount?: number;
    /** Custom list of adjectives to use instead of default */
    customAdjectives?: string[];
    /** Custom list of nouns to use instead of default */
    customNouns?: string[];
    /** Minimum length for the generated username. Default: 0 (no minimum) */
    minLength?: number;
    /** Maximum length for the generated username. Default: Infinity */
    maxLength?: number;
    /** Maximum number of attempts to generate a valid username. Default: 100 */
    maxAttempts?: number;
  };

  /**
   * Generates a random username from combinations of adjectives and nouns
   * @param options Configuration options for username generation
   * @returns A randomly generated username string or null if unable to generate a valid username
   * @example
   * generateUsername() // 'peaceful-ocean'
   * generateUsername({ separator: '_', wordCount: 3 }) // 'silent_winter_wolf'
   * generateUsername({ minLength: 10, maxLength: 20 }) // 'mystic-valley'
   */
  export function generateUsername(options: GeneratorOptions = {}): string | null {
    const {
      separator = '-',
      wordCount = 2,
      customAdjectives,
      customNouns,
      minLength = 0,
      maxLength = Infinity,
      maxAttempts = 100
    } = options;

    const adjectiveList = customAdjectives || adjectives;
    const nounList = customNouns || nouns;

    const getRandomWord = (list: string[]) =>
      list[Math.floor(Math.random() * list.length)];

    let attempts = 0;
    while (attempts < maxAttempts) {
      const words: string[] = [];

      // First words are adjectives
      for (let i = 0; i < wordCount - 1; i++) {
        words.push(getRandomWord(adjectiveList));
      }
      // Last word is a noun
      words.push(getRandomWord(nounList));

      const username = words.join(separator);

      if (username.length >= minLength && username.length <= maxLength) {
        return username;
      }

      attempts++;
    }

    // Return null if we couldn't generate a valid username
    return null;
  }

  /**
   * Generates multiple unique usernames
   * @param count Number of usernames to generate
   * @param options Configuration options for username generation
   * @returns Array of unique usernames
   */
  export function generateUsernames(count: number, options: GeneratorOptions = {}): string[] {
    const usernames = new Set<string>();
    const maxAttempts = options.maxAttempts || 100;
    let attempts = 0;

    while (usernames.size < count && attempts < maxAttempts * count) {
      const username = generateUsername(options);
      if (username) {
        usernames.add(username);
      }
      attempts++;
    }

    return Array.from(usernames);
  }
