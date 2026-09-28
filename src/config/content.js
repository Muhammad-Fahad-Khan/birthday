/**
 * ─────────────────────────────────────────────────────────────
 *  PERSONALISE EVERYTHING HERE
 *  Every word, date, memory and wish on the site comes from this
 *  file. You never need to touch the components to customise it.
 * ─────────────────────────────────────────────────────────────
 */
export const CONTENT = {
  /** Their name (or a pet name). Used in the hero, letter and title. */
  recipient: 'My Love',

  /** How you sign the letter. */
  sender: 'M.F.K',

  /** The day your story began (YYYY-MM-DD). Powers the live "our story" counters. */
  relationshipStart: '2022-02-14',

  /**
   * Background music.
   * Leave `src` empty to use the built-in music-box "Happy Birthday" (generated live, no file needed),
   * or drop an mp3 into /public/audio/ and set e.g. src: 'audio/our-song.mp3'.
   */
  music: {
    src: '',
    volume: 0.5,
  },

  hero: {
    eyebrow: 'Today, the whole universe celebrates you',
    title: 'Happy Birthday',
    quote:
      'Of all the stars in the sky, you are the one I would wish on every single time.',
    prompt: 'Scroll slowly - this little universe was made just for you.',
  },

  wishes: {
    eyebrow: 'Birthday wishes',
    title: 'Six wishes,',
    titleAccent: 'made only for you',
    lead: 'I folded every hope I have for you into these little cards. Drift through them slowly.',
    items: [
      {
        icon: '🌅',
        title: 'Mornings full of light',
        text: 'May every morning greet you with soft sunlight, warm coffee and the quiet certainty that you are deeply, endlessly loved.',
      },
      {
        icon: '🌸',
        title: 'A heart at peace',
        text: 'May your worries grow small and your joys grow loud. May you always feel safe, understood and completely at home in yourself.',
      },
      {
        icon: '✈️',
        title: 'Adventures, together',
        text: 'New cities, long drives, wrong turns and perfect sunsets. I wish us a lifetime of getting lost and finding each other again.',
      },
      {
        icon: '💫',
        title: 'Dreams that come true',
        text: 'Every dream you whisper into the night - may it find its way to you. And may I be standing right beside you when it does.',
      },
      {
        icon: '😂',
        title: 'Endless laughter',
        text: 'The kind that makes your eyes water and your cheeks ache. The kind that only happens when you are with the people who adore you.',
      },
      {
        icon: '🏡',
        title: 'A forever home',
        text: 'Not a place, but a feeling. I hope you always find it in my arms - today, tomorrow, and every birthday after this one.',
      },
    ],
  },

  story: {
    eyebrow: 'Our story, in numbers',
    title: 'Every second with you',
    titleAccent: 'counts',
    lead: 'I did the maths. It turns out loving you is the best thing I have ever spent my time on.',
    reasonsTitle: 'A few of the reasons I love you',
    reasons: [
      'your laugh',
      'the way you say my name',
      'your kindness',
      'your sleepy voice',
      'how you dance in the kitchen',
      'your courage',
      'your terrible jokes',
      'your beautiful eyes',
      'the way you care for everyone',
      'your hand in mine',
      'your patience with me',
      'simply everything',
    ],
  },

  memories: {
    eyebrow: 'A walk down memory lane',
    title: 'Our little',
    titleAccent: 'forever',
    /**
     * `image` is optional - drop photos into /public/images/memories/ and
     * set e.g. image: 'images/memories/first-date.jpg'.
     * Without an image, a soft gradient card with the emoji is shown instead.
     */
    items: [
      {
        date: 'The beginning',
        title: 'The day we met',
        text: 'I didn’t know it yet, but my whole life quietly rearranged itself around you that day.',
        emoji: '☕',
        image: '',
        colors: ['#ff5fa2', '#a855f7'],
      },
      {
        date: 'Our first date',
        title: 'Nervous hearts',
        text: 'I rehearsed a hundred things to say, and forgot every single one the moment you smiled.',
        emoji: '🌹',
        image: '',
        colors: ['#f43f5e', '#fb923c'],
      },
      {
        date: 'That trip',
        title: 'Lost, together',
        text: 'The wrong train, the right company. Still my favourite mistake we ever made.',
        emoji: '🗺️',
        image: '',
        colors: ['#8b5cf6', '#06b6d4'],
      },
      {
        date: 'Every ordinary day',
        title: 'Small, perfect things',
        text: 'Sunday breakfasts, silly voices, falling asleep mid-movie. My favourite moments are the quiet ones.',
        emoji: '🍳',
        image: '',
        colors: ['#ec4899', '#facc15'],
      },
      {
        date: 'Today',
        title: 'Your birthday',
        text: 'And here we are - another year of you in the world. The world is so much better for it.',
        emoji: '🎂',
        image: '',
        colors: ['#ff5fa2', '#ffd6a5'],
      },
    ],
  },

  celebrate: {
    eyebrow: 'Close your eyes',
    title: 'Make a wish,',
    titleAccent: 'then blow',
    lead: 'Tap each flame to blow it out - or use your microphone and blow for real.',
    candles: 3,
  },

  letter: {
    eyebrow: 'A letter, sealed with love',
    title: 'Words from',
    titleAccent: 'my heart',
    lockedText: 'Your letter is still sealed. Blow out all the candles to open it.',
    greeting: 'My dearest love,',
    paragraphs: [
      'Happy birthday to the person who turned my ordinary days into something I look forward to. Somewhere between the late-night talks and the easy silences, you became my favourite place to be.',
      'Thank you for your patience when I am difficult, for your laughter when I need it most, and for the thousand small ways you make me feel chosen. I notice all of them. I keep all of them.',
      'On this day, I hope you feel even a fraction of the love you give so freely. You deserve a year of soft mornings, brave adventures and dreams that finally say yes.',
      'However many birthdays we are lucky enough to share, I promise to celebrate you on every ordinary day in between, too.',
    ],
    signoff: 'Forever and always yours,',
  },

  finale: {
    eyebrow: 'One last thing',
    title: 'Happy Birthday',
    text: 'Make a wish tonight. I’ll spend the rest of my life trying to make it come true.',
    fireworksLabel: 'Light up the sky',
    replayLabel: 'Relive it from the start',
  },
};
