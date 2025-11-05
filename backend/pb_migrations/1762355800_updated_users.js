/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n</head>\n<body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;\">\n    <div style=\"background-color: #f8f9fa; padding: 30px; border-radius: 10px;\">\n        <h1 style=\"color: #9B8B7E; margin-top: 0;\">Vérifiez votre adresse email</h1>\n        <p>Bonjour,</p>\n        <p>Merci de vous être inscrit sur TAVUE. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>\n        <div style=\"text-align: center; margin: 30px 0;\">\n            <a href=\"{APP_URL}/verify-email?token={TOKEN}\" \n               style=\"background-color: #9B8B7E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">\n                Vérifier mon email\n            </a>\n        </div>\n        <p style=\"color: #666; font-size: 14px;\">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>\n        <p style=\"background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;\">\n            {APP_URL}/verify-email?token={TOKEN}\n        </p>\n        <p style=\"color: #999; font-size: 12px; margin-top: 30px;\">Ce lien expirera dans 7 jours.</p>\n    </div>\n</body>\n</html>"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>"
    }
  }, collection)

  return app.save(collection)
})
