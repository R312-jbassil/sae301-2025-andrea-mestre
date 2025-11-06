export const prerender = false;

import type { APIRoute } from 'astro';
import pb from '../../utils/pb';

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Vérifier l'authentification
    const authCookie = cookies.get('pb_auth');
    
    if (!authCookie) {
      return new Response(
        JSON.stringify({ error: 'Vous devez être connecté' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Restaurer l'authentification PocketBase
    pb.authStore.loadFromCookie(authCookie.value || '');

    if (!pb.authStore.isValid) {
      return new Response(
        JSON.stringify({ error: 'Session invalide' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = pb.authStore.model?.id;

    // Vérifier que l'utilisateur est propriétaire
    const record = await pb.collection('svgIA').getOne(id);
    
    if (record.user !== userId) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'êtes pas autorisé à supprimer cette lunette' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Supprimer
    await pb.collection('svgIA').delete(id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Lunette supprimée avec succès' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
