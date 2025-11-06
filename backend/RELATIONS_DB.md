# 📊 Structure de la Base de Données PocketBase

## Collections et Relations

### 1. **users** (Collection d'authentification)
Collection système de PocketBase pour gérer les utilisateurs.

**Champs principaux :**
- `id` (auto)
- `email` (unique)
- `password` (hashé)
- `nomcomplet` (texte)
- `verified` (booléen)
- `created`, `updated` (auto)

---

### 2. **lunette** (Lunettes personnalisées)
Collection pour stocker les lunettes créées via le configurateur.

**Champs :**
- `id` (auto)
- `nom_modele` (texte) - Nom du modèle de base
- `nom_personnalisation` (texte) - Nom personnalisé par l'utilisateur
- `prix` (nombre) - Prix total
- `description` (texte) - Description complète
- `taille` (nombre) - Taille des verres
- `verres` (texte) - Type de verres choisi
- `cercles` (texte) - Couleur des cercles
- `branches` (texte) - Couleur des branches
- `etui` (texte) - Type d'étui choisi
- `origine_lunette` (texte) - Source (ex: "configurateur")
- `svg_personnalise` (texte) - Code SVG personnalisé
- **`user`** (relation → users) - Propriétaire de la lunette
- **`materiau`** (relation → materiaux) - Matériau choisi
- `created`, `updated` (auto)

**Relations :**
- ✅ `user` → `users` (Many-to-One) - Chaque lunette appartient à un utilisateur
- ✅ `materiau` → `materiaux` (Many-to-One) - Une lunette a un matériau

**Règles d'accès :**
- Création : Utilisateur connecté uniquement
- Lecture : Uniquement les lunettes de l'utilisateur connecté
- Mise à jour : Uniquement le propriétaire
- Suppression : Uniquement le propriétaire

---

### 3. **svgIA** (Lunettes générées par IA)
Collection pour stocker les lunettes créées via l'IA.

**Champs :**
- `id` (auto)
- `nom` (texte) - Nom de la création
- `code` (texte) - Code SVG généré
- `prompt` (texte) - Description donnée à l'IA
- `date` (date) - Date de création
- **`user`** (relation → users) - Créateur
- `created`, `updated` (auto)

**Relations :**
- ✅ `user` → `users` (Many-to-One) - Chaque création appartient à un utilisateur

**Règles d'accès :**
- Création : Utilisateur connecté uniquement
- Lecture : Uniquement les créations de l'utilisateur connecté
- Mise à jour : Uniquement le créateur
- Suppression : Uniquement le créateur

---

### 4. **materiaux** (Matériaux disponibles)
Collection pour les différents matériaux de lunettes.

**Champs :**
- `id` (auto)
- `libelle` (texte) - Nom du matériau (ex: "Acétate", "Titane")
- `prix` (nombre) - Prix du matériau
- `created`, `updated` (auto)

**Relations :**
- Aucune relation sortante
- Référencé par : `lunette.materiau`

---

### 5. **commande** (Commandes)
Collection pour gérer les commandes des utilisateurs.

**Champs :**
- `id` (auto)
- `prix` (nombre) - Prix total de la commande
- `date` (date) - Date de la commande
- **`user`** (relation → users) - Client
- **`lunettes`** (relation → lunette) - Lunettes personnalisées commandées (multiple)
- **`lunettes_ia`** (relation → svgIA) - Lunettes IA commandées (multiple)
- `created`, `updated` (auto)

**Relations :**
- ✅ `user` → `users` (Many-to-One) - Chaque commande appartient à un utilisateur
- ✅ `lunettes` → `lunette` (Many-to-Many) - Une commande peut contenir plusieurs lunettes
- ✅ `lunettes_ia` → `svgIA` (Many-to-Many) - Une commande peut contenir plusieurs lunettes IA

**Règles d'accès :**
- Création : Utilisateur connecté uniquement
- Lecture : Uniquement les commandes de l'utilisateur connecté
- Mise à jour : Uniquement le propriétaire
- Suppression : Admin uniquement

---

## 🔗 Schéma des Relations

```
┌─────────────┐
│   users     │
│ (auth)      │
└──────┬──────┘
       │
       │ (1 to Many)
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  lunette    │    │   svgIA     │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │                  │
       │ (Many-to-1)      │
       │                  │
       ▼                  │
┌─────────────┐           │
│  materiaux  │           │
└─────────────┘           │
       ▲                  │
       │                  │
       │                  │
       └────────┬─────────┘
                │
                ▼
         ┌─────────────┐
         │  commande   │
         └─────────────┘
```

---

## 🛡️ Sécurité et Cascade Delete

### Cascade Delete activé (cascadeDelete: true)
Quand un utilisateur est supprimé, **toutes** ses données sont automatiquement supprimées :
- ✅ Ses lunettes personnalisées (`lunette`)
- ✅ Ses créations IA (`svgIA`)
- ✅ Ses commandes (`commande`)

### Cascade Delete désactivé (cascadeDelete: false)
- ❌ `lunette.materiau` → Si un matériau est supprimé, les lunettes qui l'utilisent ne sont PAS supprimées (le champ devient null)
- ❌ `commande.lunettes` → Si une lunette est supprimée, la commande reste
- ❌ `commande.lunettes_ia` → Si une création IA est supprimée, la commande reste

---

## 📝 Filtres API Utiles

### Récupérer les lunettes d'un utilisateur
```javascript
const lunettes = await pb.collection('lunette').getFullList({
  filter: `user = "${userId}"`,
  sort: '-created',
  expand: 'materiau'
});
```

### Récupérer les créations IA d'un utilisateur
```javascript
const creationsIA = await pb.collection('svgIA').getFullList({
  filter: `user = "${userId}"`,
  sort: '-created'
});
```

### Récupérer les commandes d'un utilisateur
```javascript
const commandes = await pb.collection('commande').getFullList({
  filter: `user = "${userId}"`,
  sort: '-date',
  expand: 'lunettes,lunettes_ia'
});
```

---

## 🎯 Comment ça fonctionne dans l'application

### 1. Création de lunette personnalisée (Configurateur)
```typescript
// L'utilisateur DOIT être connecté
const result = await createLunette({
  nom_modele: "Modèle Classic",
  prix: 150,
  // ... autres champs
});
// L'ID de l'utilisateur est automatiquement ajouté
```

### 2. Création de lunette IA
```typescript
// L'utilisateur DOIT être connecté
const response = await fetch('/api/saveLunetteIA', {
  method: 'POST',
  body: JSON.stringify({
    nom: "Lunettes futuristes",
    prompt: "Lunettes de sport...",
    code: "<svg>...</svg>"
  })
});
// L'ID de l'utilisateur est automatiquement ajouté côté serveur
```

### 3. Passage d'une commande
```typescript
// L'utilisateur DOIT être connecté
const commande = await pb.collection('commande').create({
  prix: totalPrice,
  date: new Date().toISOString(),
  user: pb.authStore.model.id, // Auto ajouté
  lunettes: [lunetteId1, lunetteId2],
  lunettes_ia: [svgIAId1]
});
```

---

## ✅ Checklist des relations implémentées

- [x] `lunette.user` → Lier les lunettes personnalisées aux utilisateurs
- [x] `lunette.materiau` → Lier les lunettes aux matériaux
- [x] `svgIA.user` → Lier les créations IA aux utilisateurs
- [x] `commande.user` → Lier les commandes aux utilisateurs
- [x] `commande.lunettes` → Lier les lunettes personnalisées aux commandes
- [x] `commande.lunettes_ia` → Lier les créations IA aux commandes

---

## 🔄 Migrations à appliquer

Les migrations sont automatiquement appliquées au démarrage de PocketBase.

Pour ajouter les relations manuellement via l'interface admin :
1. Ouvrir http://127.0.0.1:8090/_/
2. Sélectionner la collection
3. Cliquer sur "Fields"
4. Cliquer sur "+ New field"
5. Sélectionner "Relation" et configurer selon ce document

---

**Date de dernière mise à jour :** 6 novembre 2025
