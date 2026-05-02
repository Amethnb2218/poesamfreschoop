import { SectorPage } from '@/components/SectorPage';

export default function SectorAgri() {
  return (
    <SectorPage
      title="Secteur agriculture"
      kicker="SECTEUR AGRICOLE"
      headline="Productrices et coopératives"
      body="Traçabilité du champ au paiement, micro-hubs solaires et preuve économique portable pour faciliter l'accès au crédit et protéger le revenu."
      icon="leaf"
      tint="#1f835d"
      highlights={[
        {
          icon: 'woman-outline',
          title: 'Coopératives de femmes',
          text:
            'Suivi des tontines, paiements nets garantis et attestations économiques portables pour toutes les productrices inscrites.',
        },
        {
          icon: 'thermometer-outline',
          title: 'Hubs froids partagés',
          text:
            'Stockage sous température contrôlée, alimenté par solaire, pour réduire de 30 à 40% les pertes post-récolte.',
        },
        {
          icon: 'leaf-outline',
          title: 'Intelligence marché',
          text:
            'Recommandations de débouchés selon prix net, demande et délai. Chaque lot orienté vers le meilleur acheteur.',
        },
      ]}
    />
  );
}
