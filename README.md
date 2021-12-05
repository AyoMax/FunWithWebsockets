# TP "Fun with WebSockets"

Auteurs : BIDET Yoan, VILLATTE Maxime

## Sujet choisi

LEVEL 3 : Create your own webSocket based service :
> An Augmented Reality visio conference that adds a red nose to speakers.

## Accéder au projet

### En ligne

Le projet est accessible à l'adresse
suivante : [https://rednose2021imr3.herokuapp.com/](https://rednose2021imr3.herokuapp.com/)

### En Local

> :warning: L'exécution du projet en local peut entraîner des sauts d'images plus importants en fonction de la puissance de votre ordinateur.

Le projet peut être lancé localement en suivant les instructions suivantes :

* Cloner le dépôt du
  projet ([https://github.com/AyoMax/FunWithWebsockets.git](https://github.com/AyoMax/FunWithWebsockets.git))
* Depuis la racine du dépôt, se placer dans le dossier `Project3-AI` :

```shell
# Windows
cd .\Project3-AI\

# Linux
cd ./Project3-AI
```

* Installer les dépendances npm :

```shell
npm i
```

* Lancer le projet :

```shell
npm run start
```

* Le projet devrait être visible depuis votre navigateur à l'adresse : [http://localhost:3000/](http://localhost:3000/)
* Pour une expérience satisfaisante, suivez les instructions indiquées sur le site, notamment :
    * Autorisez l'utilisation de votre webcam sur le site

## Choix techniques

### Front end

* Utilisation de la librairie `P5.js` ;
* Utilisation de la librairie `Socket.io` ;
* Utilisation de `ml5` et `posenet` ;
* Utilisation de la librairie `Bootstrap`.

### Back end

* Utilisation du framework `express` ;
* Utilisation de la librairie `Socket.io`.

## Choix fonctionnelles

* Seulement deux utilisateurs peuvent se rejoindre dans une visioconférence.
* Chaque utilisateur peut en repérer un autre, dans le tableau d'utilisateur, pour s'y connecter via son identifiant de
  socket.
* On transmet image par image le flux vidéo des utilisateurs via des sockets. Le son n'est donc pas transmis via le
  système de visioconférence.

## Bonus

Vous trouverez dans le dossier `Project3-Whiteboard` une implémentation minimaliste d'un tableau blanc sur lequel
plusieurs participants peuvent dessiner en même temps, chacun se voyant attribuer une couleur aléatoire sur le tableau
des autres participants. A noté, un participant ne peut voir que ce qui a été dessiner après son arrivé sur le site.

Ce projet bonus peut être testé à l'adresse
suivante : [https://whiteboard2021imr3.herokuapp.com/](https://whiteboard2021imr3.herokuapp.com/)

Il peut également être lancé en local en se plaçant dans le dossier `Project3-Whiteboard` et en exécutant la
commande : `npm run start`.