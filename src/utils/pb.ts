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
  materiau?: string; // ID du matériau choisi (relation)
}

// Interface pour les matériaux
export interface MateriauData {
  id: string;
  libelle: string;
  prix: number;
  created?: string;
  updated?: string;
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
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour modifier une lunette.' };
    }

    // Vérifier que l'utilisateur est propriétaire
    const existingRecord = await pb.collection('lunette').getOne(id);
    if (existingRecord.user !== pb.authStore.model.id) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à modifier cette lunette.' };
    }

    const record = await pb.collection('lunette').update(id, data);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Supprimer une lunette (manuelle ou IA)
export async function deleteLunette(id: string, type: 'manuel' | 'ia' = 'manuel') {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour supprimer une lunette.' };
    }

    const collection = type === 'ia' ? 'svgIA' : 'lunette';

    // Vérifier que l'utilisateur est propriétaire
    const record = await pb.collection(collection).getOne(id);
    if (record.user !== pb.authStore.model.id) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à supprimer cette lunette.' };
    }

    await pb.collection(collection).delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la lunette:', error);
    return { success: false, error: error.message };
  }
}

// Supprimer toutes les lunettes de l'utilisateur connecté (manuelles ET IA)
export async function deleteAllLunettes() {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté pour supprimer vos lunettes.' };
    }

    // Récupérer UNIQUEMENT les lunettes manuelles de l'utilisateur connecté
    const lunettesManuel = await pb.collection('lunette').getFullList({
      filter: `user = "${pb.authStore.model.id}"`
    });
    
    // Récupérer UNIQUEMENT les lunettes IA de l'utilisateur connecté
    const lunettesIA = await pb.collection('svgIA').getFullList({
      filter: `user = "${pb.authStore.model.id}"`
    });
    
    // Supprimer toutes les lunettes (manuelles et IA)
    const promisesManuel = lunettesManuel.map((lunette: any) => pb.collection('lunette').delete(lunette.id));
    const promisesIA = lunettesIA.map((lunette: any) => pb.collection('svgIA').delete(lunette.id));
    
    await Promise.all([...promisesManuel, ...promisesIA]);
    
    const totalCount = lunettesManuel.length + lunettesIA.length;
    return { success: true, count: totalCount };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de toutes les lunettes:', error);
    return { success: false, error: error.message };
  }
}

// ===== FONCTIONS POUR LA COLLECTION SVGIA (Lunettes générées par IA) =====

export interface SvgIAData {
  nom: string;
  prompt: string;
  code: string;
  user?: string;
  date?: string;
}

// Créer une lunette IA
export async function createSvgIA(data: SvgIAData) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté.' };
    }

    const svgData = {
      ...data,
      user: pb.authStore.model.id,
      date: data.date || new Date().toISOString(),
    };

    const record = await pb.collection('svgIA').create(svgData);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la création de la lunette IA:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer toutes les lunettes IA de l'utilisateur
export async function getAllSvgIA(page = 1, perPage = 50) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté.' };
    }

    const resultList = await pb.collection('svgIA').getList(page, perPage, {
      sort: '-created',
      filter: `user = "${pb.authStore.model.id}"`
    });
    return { success: true, data: resultList.items, totalPages: resultList.totalPages };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des lunettes IA:', error);
    return { success: false, error: error.message };
  }
}

// Récupérer une lunette IA par ID
export async function getSvgIA(id: string) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté.' };
    }

    const record = await pb.collection('svgIA').getOne(id);
    
    if (record.user !== pb.authStore.model.id) {
      return { success: false, error: 'Vous n\'avez pas accès à cette lunette.' };
    }
    
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la lunette IA:', error);
    return { success: false, error: error.message };
  }
}

// Supprimer une lunette IA
export async function deleteSvgIA(id: string) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté.' };
    }

    // Vérifier que l'utilisateur est propriétaire
    const record = await pb.collection('svgIA').getOne(id);
    if (record.user !== pb.authStore.model.id) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à supprimer cette lunette.' };
    }

    await pb.collection('svgIA').delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la lunette IA:', error);
    return { success: false, error: error.message };
  }
}

// Mettre à jour une lunette IA
export async function updateSvgIA(id: string, data: Partial<SvgIAData>) {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: 'Vous devez être connecté.' };
    }

    const record = await pb.collection('svgIA').update(id, data);
    return { success: true, data: record };
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', error);
    return { success: false, error: error.message };
  }
}

// ===== FONCTIONS POUR LA COLLECTION MATERIAUX =====

// Récupérer tous les matériaux disponibles
export async function getMateriaux() {
  try {
    const records = await pb.collection('materiaux').getFullList<MateriauData>({
      sort: 'prix', // Trier par prix croissant
    });
    return { success: true, data: records };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des matériaux:', error);
    return { success: false, error: error.message };
  }
}