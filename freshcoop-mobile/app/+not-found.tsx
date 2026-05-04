import { Redirect } from 'expo-router';

import { useSession } from '@/context/SessionContext';

export default function NotFoundScreen() {
  const { loading, user } = useSession();

  if (loading) return null;
  if (!user) return <Redirect href="/auth" />;

  const status = String(user.status || 'Actif').toLowerCase();
  if (status === 'en attente') return <Redirect href="/pending" />;

  return <Redirect href="/(tabs)/index" />;
}
