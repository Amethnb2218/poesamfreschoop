import { Redirect } from 'expo-router';

import { useSession } from '@/context/SessionContext';

export default function NotFoundScreen() {
  const { loading, user } = useSession();

  if (loading) return null;
  if (!user) return <Redirect href="/auth" />;

  const status = String(user.status || 'Actif').toLowerCase();
  if (status === 'en attente') return <Redirect href="/pending" />;

  // Le segment (tabs) est un groupe : il n'apparaît pas dans l'URL. La racine
  // de l'app authentifiée est donc "/", pas "/(tabs)/index".
  return <Redirect href="/" />;
}
