import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./pocketbase-types";

var path = '';
if (import.meta.env.MODE === 'development')
    path = 'http://localhost:8090'    //localhost = machine de dev
else path = 'hsae301lunette.andrea-mestre.eu:443'   //url du site 

const pb = new PocketBase(path) as TypedPocketBase;

export default pb;

// Fonction pour la connexion OAuth
export async function loginWithOAuth(provider: 'google' | 'apple' | 'github') {
  try {
    const authData = await pb.collection('users').authWithOAuth2({ provider });
    return { success: true, user: authData.record };
  } catch (error: any) {
    console.error(`Erreur OAuth ${provider}:`, error);
    return { success: false, error: error.message };
  }
}