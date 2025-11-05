import PocketBase from 'pocketbase';
import type { TypedPocketBase } from "./pocketbase-types";

var path = '';
if (import.meta.env.MODE === 'development')
    path = 'http://localhost:8090'    //localhost = machine de dev
else path = 'hsae301lunette.andrea-mestre.eu:443'   //url du site 

const pb = new PocketBase(path) as TypedPocketBase;

export default pb;

// Fonction pour vérifier si l'utilisateur est connecté
export function isUserAuthenticated() {
  return pb.authStore.isValid && pb.authStore.model !== null;
}

// Fonction pour obtenir l'utilisateur connecté
export function getCurrentUser() {
  return pb.authStore.model;
}

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
  user?: string; // ID de l'utilisateur propriétaire
}

// Créer une nouvelle lunette (nécessite une connexion)
export async function createLunette(data: LunetteData) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour créer une lunette.' };
    }

    // Ajouter automatiquement l'ID de l'utilisateur connecté
    const lunetteData = {
      ...data,
      user: pb.authStore.model.id
    };

    const record = await pb.collection('lunette').create(lunetteData);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la création de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer une lunette par son ID (vérification du propriétaire)
export async function getLunette(id: string) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour voir cette lunette.' };
    }

    const record = await pb.collection('lunette').getOne(id);
    
    // Vérifier que la lunette appartient à l'utilisateur connecté
    if (record.user !== pb.authStore.model.id) {
      return { success: false, error: 'Vous n\'avez pas accès à cette lunette.' };
    }
    
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer toutes les lunettes de l'utilisateur connecté
export async function getAllLunettes(page = 1, perPage = 50) {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour voir vos lunettes.' };
    }

    // Filtrer les lunettes par utilisateur connecté
    const resultList = await pb.collection('lunette').getList(page, perPage, {
      sort: '-created',
      filter: `user = "${pb.authStore.model.id}"`
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