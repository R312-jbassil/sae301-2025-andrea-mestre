/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lunette")

  // Ajouter le champ materiau (relation vers la collection materiaux)
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "materiau_rel",
    "name": "materiau",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "materiaux",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": ["libelle"]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("lunette")

  // Retirer le champ materiau
  collection.schema.removeField("materiau_rel")

  return dao.saveCollection(collection)
})
