# Posture Coach — POC

> **Preuve de concept expérimentale.** Ce dépôt illustre une piste technique d’analyse posturale en direct à partir de la caméra d’un téléphone. Ce n’est pas un produit fini, ni un dispositif médical, ni un outil d’évaluation clinique. Le code n’a pas suivi un processus complet de validation, de sécurité, d’accessibilité ou de conformité produit. Ne l’utilise pas pour établir un diagnostic, choisir un traitement ou prendre une décision médicale.

## Démonstration

- Analyse d’une pose debout en vue de face ou de profil.
- Repérage 2D de quelques articulations et calcul de mesures indicatives.
- Score et conseils heuristiques destinés uniquement à illustrer le concept.

Les mesures dépendent du cadrage, de la distance, de la perspective, de la lumière, des vêtements et de la visibilité des articulations. Les seuils et le score ne sont pas validés scientifiquement.

## Confidentialité

La vidéo est traitée dans le navigateur et n’est pas envoyée à un serveur applicatif. Au démarrage, la page télécharge toutefois MediaPipe, ses fichiers WebAssembly et le modèle de pose depuis jsDelivr et Google Cloud Storage. Ces fournisseurs reçoivent les requêtes de téléchargement habituelles ; le flux caméra ne leur est pas transmis par cette démo.

## Utilisation

La caméra nécessite une origine HTTPS ou `localhost`. Ouvre la page sur un téléphone, appuie sur **Activer la caméra** et accorde l’autorisation au navigateur. Place le téléphone à hauteur du buste, recule pour garder le corps entier dans le cadre, puis sélectionne la vue correspondante.

Pour un essai local, sers le fichier avec un serveur HTTP local, par exemple `python3 -m http.server 8000`, puis ouvre `http://localhost:8000`.

## Dépendances

- MediaPipe Tasks Vision `0.10.21`, chargé depuis jsDelivr.
- Modèle Pose Landmarker Lite chargé depuis Google Cloud Storage.

Le prototype est volontairement minimal et ne constitue pas une application prête à l’emploi ou à la commercialisation.
