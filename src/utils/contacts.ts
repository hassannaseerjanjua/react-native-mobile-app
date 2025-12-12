import { Platform, PermissionsAndroid } from 'react-native';
import Contacts, { Contact } from 'react-native-contacts';

export interface ContactInfo {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  thumbnail?: string;
  rawContact?: Contact;
}

/**
 * Request contacts permission
 * @returns true if permission granted, false otherwise
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app would like to access your contacts.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // iOS
      const permission = await Contacts.requestPermission();
      return permission === 'authorized';
    }
  } catch (error) {
    console.error('Contact permission error:', error);
    return false;
  }
};

/**
 * Check if contacts permission is already granted
 * @returns true if permission is granted, false otherwise
 */
export const checkContactsPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      );
      return granted;
    } else {
      // iOS - Skip check, go directly to request
      // checkPermission() can freeze on some iOS versions
      return false;
    }
  } catch (error) {
    console.error('Check contact permission error:', error);
    return false;
  }
};

/**
 * Format contact data
 * @param contact Raw contact from react-native-contacts
 * @returns Formatted contact info
 */
const formatContact = (contact: Contact): ContactInfo => {
  const displayName =
    contact.displayName ||
    `${contact.givenName || ''} ${contact.familyName || ''}`.trim() ||
    'Unknown';

  const phoneNumbers = contact.phoneNumbers.map(phone => phone.number);
  const emails = contact.emailAddresses.map(email => email.email);

  return {
    id: contact.recordID,
    name: displayName,
    phoneNumbers,
    emails,
    thumbnail: contact.thumbnailPath || undefined,
    rawContact: contact,
  };
};

/**
 * Get all contacts from device
 * @returns Array of formatted contacts
 */
export const getContacts = async (): Promise<ContactInfo[]> => {
  try {
    // iOS: Request permission directly (avoids freeze with checkPermission)
    // Android: Check then request if needed
    if (Platform.OS === 'ios') {
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        console.log('Contacts permission denied');
        return [];
      }
    } else {
      const hasPermission = await checkContactsPermission();
      if (!hasPermission) {
        const granted = await requestContactsPermission();
        if (!granted) {
          console.log('Contacts permission denied');
          return [];
        }
      }
    }

    // Get all contacts
    const contacts = await Contacts.getAll();

    // Format and return contacts
    return contacts.map(formatContact);
  } catch (error) {
    console.error('Get contacts error:', error);
    return [];
  }
};

/**
 * Get contacts with phone numbers only
 * @returns Array of contacts that have at least one phone number
 */
export const getContactsWithPhoneNumbers = async (): Promise<ContactInfo[]> => {
  const contacts = await getContacts();
  return contacts.filter(contact => contact.phoneNumbers.length > 0);
};

/**
 * Search contacts by name
 * @param query Search query (name)
 * @returns Array of matching contacts
 */
export const searchContacts = async (query: string): Promise<ContactInfo[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // iOS: Request permission directly (avoids freeze)
    if (Platform.OS === 'ios') {
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        return [];
      }
    } else {
      const hasPermission = await checkContactsPermission();
      if (!hasPermission) {
        const granted = await requestContactsPermission();
        if (!granted) {
          return [];
        }
      }
    }

    const contacts = await Contacts.getContactsMatchingString(query);
    return contacts.map(formatContact);
  } catch (error) {
    console.error('Search contacts error:', error);
    return [];
  }
};

/**
 * Get a single contact by ID
 * @param contactId Contact record ID
 * @returns Contact info or null if not found
 */
export const getContactById = async (
  contactId: string,
): Promise<ContactInfo | null> => {
  try {
    // iOS: Request permission directly (avoids freeze)
    if (Platform.OS === 'ios') {
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        return null;
      }
    } else {
      const hasPermission = await checkContactsPermission();
      if (!hasPermission) {
        const granted = await requestContactsPermission();
        if (!granted) {
          return null;
        }
      }
    }

    const contact = await Contacts.getContactById(contactId);
    if (!contact) {
      return null;
    }
    return formatContact(contact);
  } catch (error) {
    console.error('Get contact by ID error:', error);
    return null;
  }
};

export default {
  getContacts,
  getContactsWithPhoneNumbers,
  searchContacts,
  getContactById,
  requestContactsPermission,
  checkContactsPermission,
};
