import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { UserProfile, SkinType, Concern, Preference } from '@/types';

const PROFILE_KEY = 'cosmetic_scanner_profile';

const defaultProfile: UserProfile = {
  skinTypes: [],
  concerns: [],
  preferences: [],
  isOnboarded: false,
};

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('[Profile] Loading profile from AsyncStorage...');
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        console.log('[Profile] Loaded. isOnboarded:', parsed.isOnboarded);
        return parsed;
      }
      console.log('[Profile] No stored profile, using default');
      return defaultProfile;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newProfile: UserProfile) => {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
      return newProfile;
    },
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      queryClient.setQueryData(['profile'], newProfile);
    },
  });

  const profile = profileQuery.data ?? defaultProfile;

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    saveMutation.mutate(updated);
  };

  const toggleSkinType = (type: SkinType) => {
    const skinTypes = profile.skinTypes.includes(type)
      ? profile.skinTypes.filter(t => t !== type)
      : [...profile.skinTypes, type];
    updateProfile({ skinTypes });
  };

  const toggleConcern = (concern: Concern) => {
    const concerns = profile.concerns.includes(concern)
      ? profile.concerns.filter(c => c !== concern)
      : [...profile.concerns, concern];
    updateProfile({ concerns });
  };

  const togglePreference = (pref: Preference) => {
    const preferences = profile.preferences.includes(pref)
      ? profile.preferences.filter(p => p !== pref)
      : [...profile.preferences, pref];
    updateProfile({ preferences });
  };

  const completeOnboarding = () => {
    updateProfile({ isOnboarded: true });
  };

  const resetProfile = () => {
    saveMutation.mutate(defaultProfile);
  };

  return {
    profile,
    isLoading: profileQuery.isLoading,
    updateProfile,
    toggleSkinType,
    toggleConcern,
    togglePreference,
    completeOnboarding,
    resetProfile,
  };
});
