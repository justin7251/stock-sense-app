import { Account, Client, Databases } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint!)
    .setProject(APPWRITE_CONFIG.projectId!);

export const account = new Account(client);
export const databases = new Databases(client);

export { client };

