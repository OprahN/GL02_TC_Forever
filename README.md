# README pour le Projet GIFT

## Description
GIFT est un utilitaire interactif pour créer, gérer et analyser des tests et questions au format GIFT (Generalized Instructional Feedback Technique). Le projet inclut la manipulation de vCards et fournit des fonctionnalités de recherche avancées.

## Fichiers Principaux
1. **exam.js**: Gestion des examens, ajout de questions, analyse de la qualité et comparaison des tests.
2. **menus.js**: Menus interactifs pour créer des tests, gérer des vCards, et rechercher des questions/examens.
3. **db_builder.js**: Construit une base de données à partir de fichiers GIFT.
4. **gift.js**: Représentation et manipulation des questions GIFT.
5. **parser.js**: Parseur pour convertir des chaînes GIFT en objets structurés.
6. **search.js**: Fonctionnalités de recherche pour questions et tests.
7. **vcard.js**: Gestion des cartes de visite numériques (vCards).
8. **main.js**: Point d'entrée principal, orchestre l'interface utilisateur du projet.

## Utilisation
Lancez `main.js` pour accéder au menu principal. Choisissez parmi les options pour créer, simuler des tests, gérer des vCards, ou rechercher des questions et des examens.

## Dépendances
- `inquirer` pour les menus interactifs
- Divers modules pour la manipulation de fichiers et de données
