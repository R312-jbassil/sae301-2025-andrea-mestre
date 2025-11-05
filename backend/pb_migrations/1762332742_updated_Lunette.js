/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3690071135")

  // update collection data
  unmarshal({
    "name": "lunette"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3690071135")

  // update collection data
  unmarshal({
    "name": "Lunette"
  }, collection)

  return app.save(collection)
})
