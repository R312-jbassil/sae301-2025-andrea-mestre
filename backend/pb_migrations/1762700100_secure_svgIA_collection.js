/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Sécuriser la collection "svgIA"
  const svgIACollection = app.findCollectionByNameOrId("svgIA")
  
  // List/Search Rule : Utilisateur connecté voit uniquement ses créations
  svgIACollection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // View Rule : Utilisateur connecté voit uniquement ses créations
  svgIACollection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Create Rule : Utilisateur connecté peut créer
  svgIACollection.createRule = "@request.auth.id != \"\""
  
  // Update Rule : Utilisateur connecté peut modifier uniquement ses créations
  svgIACollection.updateRule = "@request.auth.id != \"\" && user = @request.auth.id"
  
  // Delete Rule : Utilisateur connecté peut supprimer uniquement ses créations
  svgIACollection.deleteRule = "@request.auth.id != \"\" && user = @request.auth.id"

  return app.save(svgIACollection)
}, (app) => {
  // Rollback: retirer les règles de sécurité
  const svgIACollection = app.findCollectionByNameOrId("svgIA")
  
  svgIACollection.listRule = null
  svgIACollection.viewRule = null
  svgIACollection.createRule = null
  svgIACollection.updateRule = null
  svgIACollection.deleteRule = null

  return app.save(svgIACollection)
})
