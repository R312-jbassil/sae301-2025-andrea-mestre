# 🔐 Règles de Sécurité PocketBase - API Rules

Ce document explique comment configurer les **API Rules** dans PocketBase pour sécuriser vos collections.

---

## 📋 Pourquoi les API Rules ?

Les API Rules permettent de contrôler **qui peut faire quoi** sur vos collections :
- **Create** : Qui peut créer des enregistrements
- **Read** : Qui peut lire des enregistrements
- **Update** : Qui peut modifier des enregistrements
- **Delete** : Qui peut supprimer des enregistrements

---

## 🎯 Configuration Recommandée

### 1. Collection **lunette** (Lunettes personnalisées)

#### Onglet "API Rules" dans PocketBase Admin :

**List/Search Rule** (Lire la liste)
```javascript
@request.auth.id != "" && user = @request.auth.id
```
✅ Un utilisateur ne peut voir que ses propres lunettes

**View Rule** (Voir un enregistrement)
```javascript
@request.auth.id != "" && user = @request.auth.id
```
✅ Un utilisateur ne peut voir que ses propres lunettes

**Create Rule** (Créer)
```javascript
@request.auth.id != "" && @request.data.user = @request.auth.id
```
✅ Un utilisateur connecté peut créer des lunettes
✅ Le champ `user` doit correspondre à l'utilisateur connecté

**Update Rule** (Modifier)
```javascript
@request.auth.id != "" && user = @request.auth.id
```
✅ Un utilisateur ne peut modifier que ses propres lunettes

**Delete Rule** (Supprimer)
```javascript
@request.auth.id != "" && user = @request.auth.id
```
✅ Un utilisateur ne peut supprimer que ses propres lunettes

---

### 2. Collection **svgIA** (Lunettes générées par IA)

#### Onglet "API Rules" :

**List/Search Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**View Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**Create Rule**
```javascript
@request.auth.id != "" && @request.data.user = @request.auth.id
```

**Update Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**Delete Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

---

### 3. Collection **materiaux** (Matériaux)

Les matériaux sont **publics** mais seuls les admins peuvent les modifier.

**List/Search Rule**
```javascript
""
```
✅ Tout le monde peut voir les matériaux (vide = public)

**View Rule**
```javascript
""
```

**Create Rule**
```javascript
@request.auth.id != "" && @request.auth.role = "admin"
```
✅ Seuls les admins peuvent créer des matériaux

**Update Rule**
```javascript
@request.auth.id != "" && @request.auth.role = "admin"
```

**Delete Rule**
```javascript
@request.auth.id != "" && @request.auth.role = "admin"
```

---

### 4. Collection **commande** (Commandes)

**List/Search Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**View Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**Create Rule**
```javascript
@request.auth.id != "" && @request.data.user = @request.auth.id
```

**Update Rule**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**Delete Rule**
```javascript
null
```
❌ Les commandes ne peuvent pas être supprimées par les utilisateurs (seulement par les admins via l'interface)

---

## 🛠️ Comment appliquer ces règles

### Méthode 1 : Via l'interface PocketBase Admin

1. Ouvrir http://127.0.0.1:8090/_/
2. Cliquer sur la collection (ex: `lunette`)
3. Aller dans l'onglet **"API Rules"**
4. Coller les règles dans les champs correspondants
5. Cliquer sur **"Save changes"**

### Méthode 2 : Via une migration (recommandé pour la production)

Créer un fichier dans `pb_migrations/` :

```javascript
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("lunette")

  // List/Search Rule
  collection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // View Rule
  collection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Create Rule
  collection.createRule = "@request.auth.id != \"\" && @request.data.user = @request.auth.id"
  
  // Update Rule
  collection.updateRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Delete Rule
  collection.deleteRule = "@request.auth.id != \"\" && user = @request.auth.id"

  return app.save(collection)
}, (app) => {
  // Rollback: remettre les règles à null
  const collection = app.findCollectionByNameOrId("lunette")
  
  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
```

---

## 📖 Syntaxe des API Rules

### Variables disponibles

- `@request.auth.id` : ID de l'utilisateur connecté
- `@request.auth.email` : Email de l'utilisateur connecté
- `@request.data.FIELD` : Données envoyées dans la requête
- `FIELD` : Champ de l'enregistrement actuel

### Opérateurs

- `=` : Égalité
- `!=` : Différence
- `&&` : ET logique
- `||` : OU logique
- `@request.auth.id != ""` : Utilisateur connecté

### Exemples

**Public (tout le monde peut lire)**
```javascript
""
```

**Connecté uniquement**
```javascript
@request.auth.id != ""
```

**Propriétaire uniquement**
```javascript
@request.auth.id != "" && user = @request.auth.id
```

**Propriétaire ou admin**
```javascript
@request.auth.id != "" && (user = @request.auth.id || @request.auth.role = "admin")
```

---

## ✅ Vérification de la sécurité

Après avoir configuré les règles, testez :

1. **Test 1** : Essayer d'accéder aux lunettes d'un autre utilisateur
   - ❌ Devrait retourner une erreur 403/404

2. **Test 2** : Se connecter et créer une lunette
   - ✅ Devrait fonctionner

3. **Test 3** : Se déconnecter et essayer de créer
   - ❌ Devrait retourner une erreur 401

4. **Test 4** : Modifier/supprimer une lunette d'un autre utilisateur
   - ❌ Devrait retourner une erreur 403

---

## 🚨 Important

⚠️ **Les API Rules sont la DERNIÈRE ligne de défense**

Même si vous vérifiez côté client (TypeScript), il FAUT aussi configurer les API Rules côté serveur pour empêcher les utilisateurs malveillants de contourner votre code.

---

**Date de dernière mise à jour :** 6 novembre 2025
