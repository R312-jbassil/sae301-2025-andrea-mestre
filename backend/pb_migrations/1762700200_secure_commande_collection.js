/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Sécuriser la collection "commande"
  const commandeCollection = app.findCollectionByNameOrId("commande")
  
  // List/Search Rule : Utilisateur connecté voit uniquement ses commandes
  commandeCollection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // View Rule : Utilisateur connecté voit uniquement ses commandes
  commandeCollection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Create Rule : Utilisateur connecté peut créer
  commandeCollection.createRule = "@request.auth.id != \"\""
  
  // Update Rule : Utilisateur connecté peut modifier uniquement ses commandes
  commandeCollection.updateRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Delete Rule : Les commandes ne peuvent pas être supprimées (null)
  commandeCollection.deleteRule = null

  return app.save(commandeCollection)
}, (app) => {
  // Rollback: retirer les règles de sécurité
  const commandeCollection = app.findCollectionByNameOrId("commande")
  
  commandeCollection.listRule = null
  commandeCollection.viewRule = null
  commandeCollection.createRule = null
  commandeCollection.updateRule = null
  commandeCollection.deleteRule = null

  return app.save(commandeCollection)
})
