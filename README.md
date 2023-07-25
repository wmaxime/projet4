# Projet Final - Plate forme de staking : EV Card Charging

EVA est une application décentralisée (DAPP) qui permet d'obtenir une carte de recharge pour les véhicules électriques.

Pour créditer les recharges, les utilsiateurs doivent staker le token du projet EVCT afin d'utiliser les récompenses pour solder leur utilisations.


# Publication

Vidéo de démo : [Full Démo](https://www.loom.com/share/b328c8141de2488ca357ad1ad09d4c03)


La DAPP en live (Vercel ) : https://projet4-three.vercel.app/

    => Pré-requis : utiliser un navigateur avec le plugin Metamask sinon page blanche
    => Dans VERCEL lors du déploiement de projets "OUTPUT DIRECTORY: build" => OVERRIDE

Contrat du Token EVCT : https://sepolia.etherscan.io/address/0x2104Cd4CF337c3b1C7c2d003576Bf91D9c21f43b

Contrat du Vault : https://sepolia.etherscan.io/address/0x3454F5836249c8c721ffA399db09aB91F2222926

Contrat principal de Staking : https://sepolia.etherscan.io/address/0x7f54E2C161E410f9F7725c4507b6B5709B979071

# Outils utilisés : 

* Truffle v5.11.0
* Ganache v7.9.0
* Solidity v0.5.16
* Node v16.16.0
* Web3.js v1.10.0
* Truffle Box React (All in One) => Installation : truffle unbox react

 * Vercel (https://vercel.com/) : pour la publication de la Dapp via Github
 * Loom (https://www.loom.com/) pour les vidéos de démo
 * Blockhain network de test : SEPOLIA

# Choix des technologies : 

Pour ce projet, j'ai choisi d'utiliser la Truffle Box React car : 
- c'est l'outil qui est abordé dans la formation
- le plus simple à utiliser pour moi
- je n'ai pas eu le temps à me consacrer à utiliser Hardhat, Ethers, Wagmi, RainbowKit

# Périmètre de l'application réalisée
## La platefarme EVA doit permettre : 

Informatif:
* Page d’atterissage du projet

Utilisateurs:
* Connecter/Deconnecter son porte-feuille
* Choisir un plan de staking
* Déposer des tokens
* Retirer des tokens
* Réclamer des récompenses

Administrateur:
* Créer un plan de staking
* Mettre en pause/actif le plan de staking
* Augmenter/Diminuer le montant minimal de retrait
* Visualiser l’ensemble des plans de staking


# Captures écrans

<img src="/img/EVA_Home.png">

<img src="/img/EVA_StakingPlans.png" >

<img src="/img/EVA_StakeEVCT.png" >

<img src="/img/EVA_Admin1.png" >

<img src="/img/EVA8CreatePool.png" >

<img src="/img/EVA_ManagePool.png" >



