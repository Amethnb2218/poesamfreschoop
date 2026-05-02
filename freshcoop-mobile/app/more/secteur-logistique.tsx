import { SectorPage } from '@/components/SectorPage';

export default function SectorLogistique() {
  return (
    <SectorPage
      title="Secteur logistique"
      kicker="SECTEUR LOGISTIQUE"
      headline="Tournées froides optimisées"
      body="Les transporteurs FresCoop sécurisent la chaîne du froid entre les hubs et les acheteurs avec priorisation anti-gaspi intégrée."
      icon="bus"
      tint="#d99912"
      highlights={[
        {
          icon: 'snow-outline',
          title: 'Chaîne du froid',
          text:
            'Capteurs embarqués et suivi température en temps réel. Alertes automatiques en cas de rupture de froid.',
        },
        {
          icon: 'map-outline',
          title: 'Tournées optimisées',
          text:
            'Algorithme de priorisation : lots urgents (anti-gaspi) placés en tête de tournée pour livrer avant péremption.',
        },
        {
          icon: 'document-text-outline',
          title: 'Preuves de livraison',
          text:
            'Chaque dépôt génère un reçu signé et photo preuve, exportable pour facturation partenaires financiers.',
        },
      ]}
    />
  );
}
