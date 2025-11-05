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

// ===== FONCTIONS POUR LA COLLECTION LUNETTE =====

export interface LunetteData {
  nom_modele: string;
  nom_personnalisation?: string;
  prix: number;
  description?: string;
  taille: number;
  verres: string;
  cercles: string;
  branches: string;
  etui?: string;
  origine_lunette?: string;
}

// Créer une nouvelle lunette
export async function createLunette(data: LunetteData) {
  try {
    const record = await pb.collection('lunette').create(data);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la création de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer une lunette par son ID
export async function getLunette(id: string) {
  try {
    const record = await pb.collection('lunette').getOne(id);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer toutes les lunettes
export async function getAllLunettes(page = 1, perPage = 50) {
  try {
    const resultList = await pb.collection('lunette').getList(page, perPage, {
      sort: '-created',
    });
    return { success: true, data: resultList.items, totalPages: resultList.totalPages };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des lunettes:', error);
    return { success: false, error: error.message };
  }
}

// Mettre à jour une lunette
export async function updateLunette(id: string, data: Partial<LunetteData>) {
  try {
    const record = await pb.collection('lunette').update(id, data);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Supprimer une lunette
export async function deleteLunette(id: string) {
  try {
    await pb.collection('lunette').delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Supprimer toutes les lunettes (utilisé pour "Tout supprimer")
export async function deleteAllLunettes() {
  try {
    const lunettes = await pb.collection('lunette').getFullList();
    const promises = lunettes.map((lunette: any) => pb.collection('lunette').delete(lunette.id));
    await Promise.all(promises);
    return { success: true, count: lunettes.length };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de toutes les lunettes:', error);
    return { success: false, error: error.message };
  }
}