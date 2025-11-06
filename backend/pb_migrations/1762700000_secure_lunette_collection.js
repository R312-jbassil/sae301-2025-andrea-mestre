/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Sécuriser la collection "lunette"
  const lunetteCollection = app.findCollectionByNameOrId("lunette")
  
  // List/Search Rule : Utilisateur connecté voit uniquement ses lunettes
  lunetteCollection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // View Rule : Utilisateur connecté voit uniquement ses lunettes
  lunetteCollection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Create Rule : Utilisateur connecté peut créer
  lunetteCollection.createRule = "@request.auth.id != \"\""
  
  // Update Rule : Utilisateur connecté peut modifier uniquement ses lunettes
  lunetteCollection.updateRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Delete Rule : Utilisateur connecté peut supprimer uniquement ses lunettes
  lunetteCollection.deleteRule = "@request.auth.id != \"\" && user = @request.auth.id"

  return app.save(lunetteCollection)
}, (app) => {
  // Rollback: retirer les règles de sécurité
  const lunetteCollection = app.findCollectionByNameOrId("lunette")
  
  lunetteCollection.listRule = null
  lunetteCollection.viewRule = null
  lunetteCollection.createRule = null
  lunetteCollection.updateRule = null
  lunetteCollection.deleteRule = null

  return app.save(lunetteCollection)
})
