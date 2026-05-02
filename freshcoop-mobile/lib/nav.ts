// Mapping des pages secondaires accessibles depuis "Plus" du profil.
// Reproduit getMenuLinks du site (App.jsx:6716) pour garder la parité.

import type { Ionicons } from '@expo/vector-icons';

export type MoreLink = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  path: string; // route expo-router
};

export const MORE_LINKS: Record<string, MoreLink> = {
  roi: {
    key: 'roi',
    label: 'Mon gain FresCoop',
    description: 'Calcul ROI et revenu protégé',
    icon: 'trending-up',
    path: '/more/roi',
  },
  antigaspi: {
    key: 'antigaspi',
    label: 'Anti-gaspi',
    description: 'Alertes DLC et ventes éclair',
    icon: 'leaf',
    path: '/more/antigaspi',
  },
  bancabilite: {
    key: 'bancabilite',
    label: 'Bancabilité',
    description: 'Score crédit et dossier finance',
    icon: 'business',
    path: '/more/bancabilite',
  },
  dossiers: {
    key: 'dossiers',
    label: 'Dossiers',
    description: 'Pièces et demandes documentaires',
    icon: 'folder-open',
    path: '/more/dossiers',
  },
  attestations: {
    key: 'attestations',
    label: 'Attestations',
    description: 'Certificats émis sur preuves',
    icon: 'checkmark-done-circle',
    path: '/more/attestations',
  },
  preuves: {
    key: 'preuves',
    label: 'Preuves économiques',
    description: 'Transactions et justificatifs',
    icon: 'receipt',
    path: '/more/preuves',
  },
  paiement: {
    key: 'paiement',
    label: 'Paiement',
    description: 'Paiements et reçus',
    icon: 'card',
    path: '/more/paiement',
  },
  utilisateurs: {
    key: 'utilisateurs',
    label: 'Utilisateurs',
    description: 'Comptes, rôles et statuts',
    icon: 'people',
    path: '/more/utilisateurs',
  },
  donnees: {
    key: 'donnees',
    label: 'Données',
    description: 'Export et maintenance',
    icon: 'server',
    path: '/more/donnees',
  },
  ussd: {
    key: 'ussd',
    label: 'USSD',
    description: '*384*FRES# - accès sans Internet',
    icon: 'call',
    path: '/more/ussd',
  },
  secteurAgri: {
    key: 'secteurAgri',
    label: 'Secteur agriculture',
    description: 'Ressources et actualités',
    icon: 'leaf-outline',
    path: '/more/secteur-agri',
  },
  secteurCommerce: {
    key: 'secteurCommerce',
    label: 'Secteur commerce',
    description: 'Place de marché B2B2C',
    icon: 'storefront',
    path: '/more/secteur-commerce',
  },
  secteurLogistique: {
    key: 'secteurLogistique',
    label: 'Secteur logistique',
    description: 'Transport et tournées',
    icon: 'bus',
    path: '/more/secteur-logistique',
  },
};

// Reproduit EXACTEMENT getMenuLinks du site, moins les pages déjà en tabs
// (cockpit, market, cart, lots, products, operations, impact, profile).
export function getMoreLinksForRole(role: string | undefined): MoreLink[] {
  const keys = (() => {
    switch (role) {
      case 'admin':
        return [
          'utilisateurs',
          'dossiers',
          'attestations',
          'preuves',
          'antigaspi',
          'bancabilite',
          'ussd',
          'donnees',
          'secteurAgri',
          'secteurCommerce',
          'secteurLogistique',
        ];
      case 'agriculteur':
        return [
          'roi',
          'antigaspi',
          'bancabilite',
          'ussd',
          'dossiers',
          'attestations',
          'preuves',
          'secteurAgri',
        ];
      case 'agentTerrain':
        return ['antigaspi', 'ussd'];
      case 'transporteur':
        return [
          'antigaspi',
          'dossiers',
          'attestations',
          'preuves',
          'secteurLogistique',
        ];
      case 'client':
        return ['antigaspi', 'paiement', 'attestations'];
      case 'acheteurB2B':
        return ['antigaspi', 'paiement', 'attestations'];
      case 'partenaire':
        return ['bancabilite', 'preuves', 'antigaspi', 'ussd'];
      default:
        return [];
    }
  })();
  return keys.map((k) => MORE_LINKS[k]).filter(Boolean) as MoreLink[];
}
