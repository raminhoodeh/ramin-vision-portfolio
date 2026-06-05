import meaningBookAnimatedPortrait from './books/meaning-of-life/book-animated-portrait.webp';
import meaningBookCover from './books/meaning-of-life/book-cover.webp';
import meaningBookWidescreen from './books/meaning-of-life/book-widescreen.webp';
import meaningEdenGardenPortrait from './books/meaning-of-life/eden-garden-portrait.webp';
import meaningQuotePage from './books/meaning-of-life/quote-page.webp';
import meaningSerpentWidescreen from './books/meaning-of-life/serpent-widescreen.webp';
import meaningSnakePortrait from './books/meaning-of-life/snake-portrait.webp';
import propositionAdamEveCharacter from './books/proposition/adam-eve-character.webp';
import propositionAdamMeetsGod from './books/proposition/adam-meets-god.webp';
import propositionBackCover from './books/proposition/back-cover.webp';
import propositionBookCharacter from './books/proposition/book-character.webp';
import propositionBookCover from './books/proposition/book-cover.webp';
import propositionBookOpen from './books/proposition/book-open.webp';
import propositionFrontCoverExtended from './books/proposition/front-cover-extended.webp';
import propositionGardenOfEden from './books/proposition/garden-of-eden.webp';
import propositionLoverCharacter from './books/proposition/lover-character.webp';
import propositionMagicianCharacter from './books/proposition/magician-character.webp';
import propositionRaminVisionLogo from './books/proposition/ramin-vision-logo.webp';
import propositionSerpent from './books/proposition/serpent.webp';
import propositionSnakeFinal from './books/proposition/snake-final.webp';
import propositionTriptych from './books/proposition/triptych.webp';
import propositionWarriorCharacterTransparent from './books/proposition/warrior-character-transparent.webp';
import propositionWarriorCharacter from './books/proposition/warrior-character.webp';
import aiProductManagerCourse from './courses/ai-product-manager-course.webp';
import productInnovationCourse from './courses/product-innovation-course.webp';
import productInnovationLaptop from './courses/product-innovation-laptop.webp';
import tedxTalk from './talks/tedx-talk.webp';
import universityTalk from './talks/university-talk.webp';

export const thoughtsAssets = {
  talks: {
    tedxTalk,
    universityTalk,
  },
  courses: {
    aiProductManagerCourse,
    productInnovationCourse,
    productInnovationLaptop,
  },
  books: {
    proposition: {
      adamEveCharacter: propositionAdamEveCharacter,
      adamMeetsGod: propositionAdamMeetsGod,
      backCover: propositionBackCover,
      bookCharacter: propositionBookCharacter,
      bookCover: propositionBookCover,
      bookOpen: propositionBookOpen,
      frontCoverExtended: propositionFrontCoverExtended,
      gardenOfEden: propositionGardenOfEden,
      loverCharacter: propositionLoverCharacter,
      magicianCharacter: propositionMagicianCharacter,
      raminVisionLogo: propositionRaminVisionLogo,
      serpent: propositionSerpent,
      snakeFinal: propositionSnakeFinal,
      triptych: propositionTriptych,
      warriorCharacter: propositionWarriorCharacter,
      warriorCharacterTransparent: propositionWarriorCharacterTransparent,
    },
    meaningOfLife: {
      bookAnimatedPortrait: meaningBookAnimatedPortrait,
      bookCover: meaningBookCover,
      bookWidescreen: meaningBookWidescreen,
      edenGardenPortrait: meaningEdenGardenPortrait,
      quotePage: meaningQuotePage,
      serpentWidescreen: meaningSerpentWidescreen,
      snakePortrait: meaningSnakePortrait,
    },
  },
} as const;
