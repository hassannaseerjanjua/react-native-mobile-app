/**
 * Firebase Topics Helper
 * Matches the C# FirebaseTopics class pattern
 */
export class FirebaseTopics {
  static CityEn(cityId: number): string {
    return `CITY_${cityId}EN`;
  }

  static CityAr(cityId: number): string {
    return `CITY${cityId}_AR`;
  }

  static readonly GENERAL_EN = 'GENERAL_EN';
  static readonly GENERAL_AR = 'GENERAL_AR';
}

/**
 * Get the appropriate city topic based on language
 */
export const getCityTopic = (cityId: number, langCode: 'en' | 'ar'): string => {
  return langCode === 'en'
    ? FirebaseTopics.CityEn(cityId)
    : FirebaseTopics.CityAr(cityId);
};

/**
 * Get the general topic based on language
 */
export const getGeneralTopic = (langCode: 'en' | 'ar'): string => {
  return langCode === 'en'
    ? FirebaseTopics.GENERAL_EN
    : FirebaseTopics.GENERAL_AR;
};

/**
 * Get all topics for a given language and city
 */
export const getTopicsForLanguage = (
  cityId: number | null,
  langCode: 'en' | 'ar',
): string[] => {
  const topics: string[] = [];

  // Add general topic for language
  topics.push(getGeneralTopic(langCode));

  // Add city topic if city ID is available
  if (cityId) {
    topics.push(getCityTopic(cityId, langCode));
  }

  return topics;
};
