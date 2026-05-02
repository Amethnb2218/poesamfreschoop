import { SectorPage } from '@/components/SectorPage';

export default function SectorCommerce() {
  return (
    <SectorPage
      title="Secteur commerce"
      kicker="SECTEUR COMMERCE"
      headline="Marché B2B2C transparent"
      body="Place de marché qui connecte productrices, commerçantes et clients finaux sur des lots tracés, avec preuve de prix net à chaque transaction."
      icon="storefront"
      tint="#247f9a"
      highlights={[
        {
          icon: 'pricetag-outline',
          title: 'Prix net garanti',
          text:
            'Zéro commission cachée. Chaque achat protège la marge de la productrice et reste traçable sur le reçu.',
        },
        {
          icon: 'people-outline',
          title: 'Acheteurs B2B',
          text:
            'Restaurateurs, industriels et revendeurs sourcent des lots calibrés avec certificats qualité et traçabilité.',
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Anti-gaspi',
          text:
            'Alertes en temps réel sur les lots à DLC courte avec jusqu\'à -40% de remise : un gain pour l\'acheteur, zéro perte pour le producteur.',
        },
      ]}
    />
  );
}
