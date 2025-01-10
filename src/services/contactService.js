import { getContacts, addContact, acceptContact, rejectContact } from './apiService.js';

export async function fetchContacts() {
    try {
        return await getContacts();
    } catch (error) {
        console.error('Failed to fetch contacts:', error);
        throw new Error('Unable to fetch contacts. Please try again.');
    }
}

export async function createContact(pubkey) {
    try {
        return await addContact({ pubkey });
    } catch (error) {
        console.error('Failed to add contact:', error);
        throw new Error('Unable to add contact. Please try again.');
    }
}

export async function approveContact(pubkey) {
    try {
        return await acceptContact(pubkey);
    } catch (error) {
        console.error('Failed to accept contact:', error);
        throw new Error('Unable to accept contact. Please try again.');
    }
}

export async function declineContact(pubkey) {
    try {
        return await rejectContact(pubkey);
    } catch (error) {
        console.error('Failed to reject contact:', error);
        throw new Error('Unable to reject contact. Please try again.');
    }
}
