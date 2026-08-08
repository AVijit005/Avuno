import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { setAccessToken } from "@/lib/api/fetch";
import { queryKeys } from "@/lib/api/query-keys";
import type { LoginInput, RegisterInput, AuthResponse, UserResponse } from "@/lib/api/auth";

export function useCurrentUser() {
  return useQuery<UserResponse>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: (input) => authApi.login(input),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<UserResponse, Error, RegisterInput>({
    mutationFn: (input) => authApi.register(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => authApi.logoutUser(),
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => authApi.logoutAll(),
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail({ token }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification({ email }),
  });
}
