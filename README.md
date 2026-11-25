# Repère — Coach musculation (POC)

> **Preuve de concept expérimentale.** Cette démo explore un coach visuel qui repère un mouvement depuis la caméra. Ce n’est pas un produit fini, un dispositif médical ou un outil validé pour prévenir les blessures. Les indications ne remplacent pas l’avis d’un professionnel et ne permettent pas de décider de poursuivre un mouvement douloureux.

## Périmètre actuel

- Un seul exercice : développé épaules avec un haltère dans chaque main.
- Détection du cycle bilatéral à partir des angles des coudes et de la hauteur des poignets.
- HUD vidéo, comptage des répétitions, phase du mouvement et bouton plein écran.
- Vitesse moyenne de variation de l’angle des coudes pendant la descente et la poussée, affichée en degrés par seconde (°/s). Ce n’est pas la vitesse réelle des haltères.
- Symétrie estimée par l’écart d’amplitude gauche/droite et le décalage d’arrivée au sommet, avec un bilan lisible « proche » ou « écart à observer ».
- Variation maximale de l’inclinaison du buste pendant la répétition, calculée en 2D à partir des épaules et des hanches.
- Position latérale de chaque poignet par rapport à son épaule au sommet, exprimée en pourcentage de la largeur des épaules.
- Après quelques répétitions, une baisse de vitesse de poussée par rapport aux premières répétitions est affichée comme tendance. Ce n’est pas une mesure de fatigue musculaire.

La caméra ne détecte pas les haltères et ne mesure pas leur poids. Les autres exercices, le stretching, l’analyse complète de la technique et la détection de fatigue réelle restent hors périmètre.

## Utilisation

Ouvre la démo sur téléphone en HTTPS et autorise la caméra. Place le téléphone face à toi à environ 2–3 m ; garde visibles les épaules, les coudes et les mains, dans une bonne lumière. Tiens un haltère dans chaque main, commence avec les haltères près des épaules et pousse-les vers le haut à ton rythme. Le bouton ⛶ affiche la vidéo en plein écran avec le HUD.

Pour un essai local, sers le fichier avec un serveur HTTP, par exemple python3 -m http.server 8000, puis ouvre localhost:8000.

## Limites

L’angle du coude est calculé entre épaule, coude et poignet, en degrés. Les vitesses sont des moyennes calculées sur les phases détectées, pas une mesure continue du trajet des haltères. La variation du buste compare son inclinaison au début et pendant la répétition ; elle ne détecte pas une cambrure avant/arrière depuis une vue de face. Le décalage des poignets est leur distance horizontale aux épaules au sommet, normalisée par la largeur des épaules. Les angles 2D dépendent du cadrage, de la perspective, de la lumière et de la visibilité des articulations ; ces indices ne constituent pas une analyse biomécanique complète. Le ralentissement peut avoir plusieurs causes ; il ne prédit ni la fatigue musculaire, ni une blessure, ni la sécurité d’une charge. Commence léger et arrête si tu ressens une douleur.

## Confidentialité et dépendances

La vidéo est traitée dans le navigateur et n’est pas envoyée à un serveur applicatif. Au démarrage, la page télécharge MediaPipe Tasks Vision 0.10.21 depuis jsDelivr et le modèle Pose Landmarker Lite depuis Google Cloud Storage ; ces fournisseurs reçoivent les requêtes de téléchargement, pas le flux caméra de cette démo.

Le code est contenu dans index.html, avec des sections distinctes pour configuration, géométrie, reconnaissance de l’exercice, analyse de série, modèle, HUD et cycle de vie caméra. Le prototype reste minimal et n’a pas fait l’objet d’une validation produit ou clinique.

## Comparaison MediaPipe / YOLO26

- [Démo MediaPipe](https://txtony.github.io/posture-coach-demo/) : index.html conservé sans modification.
- [Démo YOLO26 Nano Pose](https://txtony.github.io/posture-coach-demo/yolo.html) : même interface adaptative, HUD et logique de développé épaules, avec ONNX Runtime Web 1.23.2.

YOLO utilise 17 articulations COCO ; seules épaules, coudes, poignets et hanches sont adaptées aux indices de l’analyse existante. Reste seul dans le cadre : la personne de plus forte confiance est sélectionnée, sans suivi d’identité entre plusieurs personnes. Une perte de pose réinitialise le cycle incomplet après 500 ms.

Le moteur Auto essaie WebGPU, puis WASM en cas d’échec ; le sélecteur permet de forcer WASM. WASM utilise un seul thread pour fonctionner sur GitHub Pages sans en-têtes d’isolation. La vidéo reste locale ; jsDelivr et Hugging Face reçoivent uniquement les requêtes des dépendances et du modèle.

### Modèle et format vérifiés

[Export FP32 épinglé](https://huggingface.co/prithivMLmods/YOLO26-ONNX/blob/1079a1c/yolo26n-pose/yolo26n-pose.onnx), environ 12,1 Mo, licence AGPL-3.0 indiquée dans ses métadonnées. [Documentation Ultralytics](https://docs.ultralytics.com/integrations/onnx/).

Entrée images float32 [1,3,640,640] : RGB / 255, format NCHW, redimensionnement proportionnel et remplissage gris 114. Sortie output0 float32 [1,300,57] : x1,y1,x2,y2,score,classe puis 17 triplets x,y,confiance. Coordonnées en pixels du carré 640 ; le remplissage est retiré pour le rendu. Export end-to-end sans NMS supplémentaire. Le fichier a été exécuté avec ONNX Runtime sur une image publique Ultralytics pour contrôler ces valeurs.

### Vérification et performances

Le bouton « Tester le modèle sans caméra » télécharge le modèle et exécute un échauffement puis une inférence ; il vérifie aussi le type et la forme de la sortie. Tester Auto puis WASM avant d’activer la caméra.

En session, inférence = durée de session.run ; cycle = prétraitement, inférence et décodage ; cadence = fréquence réelle des résultats successifs, pas la fréquence d’affichage vidéo. Les mesures varient selon le téléphone et la chauffe. Aucun débit mobile n’est garanti.

Avant utilisation, vérifier sur le téléphone cible : autorisation caméra, rotation, changement avant/arrière, plein écran, arrêt/redémarrage, perte puis retour des bras, et répétitions réelles. Le test sans caméra ne valide pas la précision du comptage ni la technique sportive.
