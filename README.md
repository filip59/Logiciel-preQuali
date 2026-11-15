# PréQuali — Application de préqualification hypothécaire

## État actuel du projet

**Bloc 1 (fondations)** : schéma Prisma, seed, moteur de calcul ABD/ATD, config en base.

**Bloc 2 (questionnaire), livré** :

- Landing page + pages légales provisoires (à faire valider par un juriste)
- Questionnaire en 7 étapes avec barre de progression en escalier et retour arrière
  (étapes 1 à 4 : infos, revenus multi-acheteurs, dettes, mise de fonds)
- Validation par Zod, **mêmes schémas côté client et côté serveur** (`lib/validation/schemas.ts`)
- `POST /api/simulation` : valide, calcule côté serveur, enregistre, renvoie un résumé
  **sans les montants estimés** (le résultat reste verrouillé, rien à lire dans le navigateur)
- Étape 5 : écran de résultat verrouillé (valeurs factices masquées)
- Étape 6 : coordonnées + 3 consentements (2 obligatoires, 1 facultatif) + textes exacts du cahier des charges
- `POST /api/simulation/[id]/contact` : valide les consentements côté serveur, crée le Lead et
  journalise le consentement (dates, versions des politiques, IP seulement si `STORE_CONSENT_IP=true`)
- Rate limiting (Upstash si configuré, sinon mémoire locale), en-têtes de sécurité HTTP
- Pied de page légal sur toutes les pages

**Reste à livrer** :

1. Vérification OTP courriel (Resend) + SMS (Twilio), déverrouillage du résultat complet
2. Génération du rapport PDF
3. Tableau de bord administrateur (NextAuth, liste des prospects, recherche/filtres, statut des consentements, édition de `MortgageConfig`)
4. Demandes de retrait de consentement / accès / suppression, désabonnement
5. Finalisation sécurité (CSP, session signée pour les routes de simulation) et guide de déploiement

> Choix de confidentialité : aucune donnée du questionnaire n'est stockée dans le navigateur
> (pas de localStorage). Recharger la page recommence le questionnaire.

## Démarrage local

### 1. Prérequis
- Node.js 20+
- Une base PostgreSQL (locale via Docker, ou un service comme Neon/Supabase)

### 2. Installation

```bash
npm install
cp .env.example .env.local
# Remplir .env.local (au minimum DATABASE_URL pour ce bloc)
```

### 3. Base de données

```bash
npm run prisma:migrate   # crée les tables
npm run seed              # initialise les paramètres de calcul + compte admin démo
```

### 4. Vérifier le moteur de calcul

Le moteur est testable indépendamment du serveur web une fois Prisma généré :

```bash
npm run prisma:generate
```

Exemple d'utilisation (sera exposé via l'API dans le prochain bloc) :

```ts
import { calculerCapaciteHypothecaire } from "@/lib/calcul/engine";
import { getMortgageConfig } from "@/lib/config/mortgage-config";

const config = await getMortgageConfig();
const resultat = calculerCapaciteHypothecaire(input, config);
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Puis ouvrir http://localhost:3000 (landing) et http://localhost:3000/simulation (questionnaire).
Le questionnaire a besoin de `DATABASE_URL` et d'avoir exécuté `prisma:migrate` + `seed`.

## Paramètres du moteur de calcul (modifiables sans redéploiement)

Stockés dans la table `MortgageConfig`, éditables via le futur tableau de
bord admin :

| Clé | Valeur par défaut | Description |
|---|---|---|
| `TAUX_HYPOTHECAIRE_ESTIMATIF` | 5.24% | Taux contractuel utilisé pour le paiement affiché |
| `TAUX_QUALIFICATION` | 7.24% | Taux de qualification (stress test) |
| `RATIO_ABD_MAX` | 39% | Ratio d'amortissement brut de la dette max |
| `RATIO_ATD_MAX` | 44% | Ratio d'amortissement total de la dette max |
| `AMORTISSEMENT_ANNEES` | 25 | Durée d'amortissement |
| `TAXES_MUNICIPALES_POURCENT_PRIX` | 0.9% | Taxes municipales annuelles en % du prix d'achat |
| `FRAIS_CHAUFFAGE_MENSUEL_DEFAUT` | 100$ | Estimation des frais de chauffage mensuels |

## Déploiement (aperçu — détaillé au bloc final)

- **App** : Vercel (build Next.js standard)
- **Base de données** : Neon ou Supabase (PostgreSQL managé, compatible Prisma)
- **Variables d'environnement** : à configurer dans le tableau de bord Vercel
- **Migrations** : exécuter `npx prisma migrate deploy` lors du déploiement
