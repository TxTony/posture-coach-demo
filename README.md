# Repère — Coach musculation (POC)

> **Preuve de concept expérimentale.** Cette démo explore un coach visuel qui repère un mouvement depuis la caméra. Ce n’est pas un produit fini, un dispositif médical ou un outil validé pour prévenir les blessures. N’utilise pas ses indications pour établir un diagnostic ou décider de poursuivre un exercice douloureux.

## Périmètre actuel

- Un seul exercice : squat au poids du corps, reconnu automatiquement à partir de la flexion et de l’extension des genoux.
- HUD superposé à la vidéo, comptage des répétitions complètes, phase du mouvement et plein écran.
- Indications de tempo descente/remontée et écart angulaire gauche/droite.
- À partir de quatre répétitions, un ralentissement de la remontée est signalé comme tendance observable. Ce n’est pas une mesure de fatigue musculaire.

Le matériel n’est pas détecté dans cette version ; la charge est explicitement le poids du corps. Les autres exercices et le stretching restent hors périmètre de ce POC.

## Utilisation

Ouvre la démo sur téléphone en HTTPS et autorise la caméra. Place le téléphone à environ 2–3 m, corps entier visible, de profil ou de trois-quarts. Appuie sur Démarrer et fais quelques squats complets à vide. Le bouton ⛶ affiche la vidéo en plein écran avec le HUD.

Pour un essai local, sers le fichier avec un serveur HTTP, par exemple python3 -m http.server 8000, puis ouvre localhost:8000.

## Limites

Les angles 2D dépendent du cadrage, de la perspective, de la lumière et de la visibilité des articulations. La symétrie affichée est une différence d’angles estimée par caméra, pas une analyse biomécanique complète. Une caméra unique ne permet pas de mesurer directement le poids soulevé ni de prédire une blessure. Arrête si tu ressens une douleur.

## Confidentialité et dépendances

La vidéo est traitée dans le navigateur et n’est pas envoyée à un serveur applicatif. Au démarrage, la page télécharge MediaPipe Tasks Vision 0.10.21 depuis jsDelivr et le modèle Pose Landmarker Lite depuis Google Cloud Storage ; ces fournisseurs reçoivent les requêtes de téléchargement, pas le flux caméra de cette démo.

Le code est contenu dans index.html, avec des sections distinctes pour configuration, géométrie, reconnaissance de l’exercice, analyse de série, modèle, HUD et cycle de vie caméra. Le prototype reste minimal et n’a pas fait l’objet d’une validation produit ou clinique.
