export const prerender = false;

import type { APIRoute } from 'astro';
import pb from '../../utils/pb';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const authCookie = cookies.get('pb_auth');
    
    if (authCookie?.value) {
      try {
        const authData = JSON.parse(decodeURIComponent(authCookie.value));
        if (authData.token && authData.model) {
          pb.authStore.save(authData.token, authData.model);
        }
      } catch (e) {
        console.error('Erreur lors du chargement de l\'authentification:', e);
      }
    }

    if (!pb.authStore.isValid || !pb.authStore.model) {
      return new Response(
        JSON.stringify({ 
          error: 'Vous devez être connecté pour sauvegarder vos créations.',
          requireAuth: true 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { nom, prompt, code } = body;

    if (!nom || !prompt || !code) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = pb.authStore.model.id;

    // Créer les données à sauvegarder
    const dataToSave: any = {
      nom,
      prompt,
      code,
      date: new Date().toISOString(),
      user: userId // L'utilisateur est toujours ajouté
    };

    // Sauvegarder dans la collection svgIA
    const record = await pb.collection('svgIA').create(dataToSave);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: record.id,
        message: 'Lunettes sauvegardées avec succès' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur serveur' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
