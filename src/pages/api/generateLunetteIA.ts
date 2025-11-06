export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Le prompt est requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configuration OpenRouter
    const HF_TOKEN = import.meta.env.HF_TOKEN;
    const HF_URL = import.meta.env.HF_URL;
    const HF_MODEL = import.meta.env.HF_MODEL;

    if (!HF_TOKEN || !HF_URL || !HF_MODEL) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration OpenRouter manquante. Vérifiez vos variables d\'environnement.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer le prompt pour l'IA
    const systemPrompt = `Tu es un expert en design de lunettes et en SVG. Tu dois générer du code SVG valide pour créer des lunettes basées sur la description fournie.

IMPORTANT - RÈGLES STRICTES:
1. Génère UNIQUEMENT le code SVG, sans aucun texte avant ou après
2. Le SVG doit commencer par <svg et se terminer par </svg>
3. Utilise des viewBox appropriés (ex: viewBox="0 0 500 200")
4. Crée des lunettes avec des branches, des verres et une monture
5. Utilise des couleurs et formes variées selon la description
6. Le code doit être valide et complet
7. NE PAS inclure de balises markdown comme \`\`\`svg ou \`\`\`

Exemple de structure:
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Verre gauche -->
  <ellipse cx="100" cy="100" rx="60" ry="50" fill="lightblue" opacity="0.7" stroke="black" stroke-width="3"/>
  
  <!-- Pont -->
  <line x1="160" y1="100" x2="190" y2="100" stroke="black" stroke-width="3"/>
  
  <!-- Verre droit -->
  <ellipse cx="250" cy="100" rx="60" ry="50" fill="lightblue" opacity="0.7" stroke="black" stroke-width="3"/>
  
  <!-- Branches -->
  <line x1="40" y1="100" x2="10" y2="120" stroke="black" stroke-width="3"/>
  <line x1="310" y1="100" x2="340" y2="120" stroke="black" stroke-width="3"/>
</svg>`;

    const userPrompt = `Génère des lunettes SVG avec ces caractéristiques: ${prompt}

Rappel: Génère UNIQUEMENT le code SVG, sans texte autour, sans balises markdown.`;

    // Appel à l'API OpenRouter
    const response = await fetch(`${HF_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4321',
        'X-Title': 'TAVUE Lunettes Generator',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur OpenRouter:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la communication avec l\'IA. Veuillez réessayer.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    let svgCode = data.choices[0]?.message?.content || '';
    
    if (!svgCode) {
      return new Response(
        JSON.stringify({ error: 'Aucun contenu généré par l\'IA' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Nettoyer le code SVG
    svgCode = svgCode.trim();
    
    // Retirer les balises markdown
    svgCode = svgCode.replace(/```svg\n?/g, '');
    svgCode = svgCode.replace(/```\n?/g, '');
    
    // Retirer les balises spécifiques des modèles IA
    svgCode = svgCode.replace(/<s>/g, '');
    svgCode = svgCode.replace(/<\/s>/g, '');
    svgCode = svgCode.replace(/\[OUT\]/g, '');
    svgCode = svgCode.replace(/\[\/OUT\]/g, '');
    svgCode = svgCode.replace(/\[INST\]/g, '');
    svgCode = svgCode.replace(/\[\/INST\]/g, '');
    
    svgCode = svgCode.trim();
    
    // Vérifier que c'est bien du SVG
    if (!svgCode.startsWith('<svg')) {
      // Essayer de trouver le SVG dans la réponse
      const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        svgCode = svgMatch[0];
      } else {
        return new Response(
          JSON.stringify({ error: 'Le code généré n\'est pas du SVG valide' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ svg: svgCode }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erreur lors de la génération:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur. Veuillez réessayer.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
